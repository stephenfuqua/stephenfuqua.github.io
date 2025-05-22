---
title: "Docker Containers in the SDLC: .NET Core SDK"
date: 2025-04-03
comments: true
tags:
- programming
- architecture
- dotnet
sharing: true
excerpt_separator: <!-- truncate -->
mermaid: true
---

Containerization of an application benefits operations of the application by
solving the problem of "it works on my machine" (at least, for the application
itself). The container holds the operating system and all needed components.
Once you have Docker on a host - whether localhost, on-prem data center, or in
the Cloud - you can run the application with greater confidence, knowing that
the application will execute the same in all environments.

But the benefits of containerization can also shift left in the development
lifecycle. For example: have you ever needed to revisit an older application,
and realized that you don't have the SDK on your machine? Instead of installing
the SDK locally, you may be able to run the SDK in a [Docker
container](https://www.docker.com).

{: .center-block }
![The first henbit of the season](/images/henbit-2025.webp){: .img-fluid .border .rounded }

{: .figure .figure-caption}
[_Lamium amplexicaule_](https://en.wikipedia.org/wiki/Lamium_amplexicaule) aka
henbit, the first flower to appear in my yard this year.

<!-- truncate -->

_This is article is part 1 in a planned series on using Docker containers in the
software development lifecycle (SDLC)._

## Revisiting a .NET Core 3.1 Application

The [Ed-Fi ODS Admin
App](https://github.com/Ed-Fi-Alliance-OSS/Ed-Fi-ODS-AdminApp/tree/v2.1.1)
(v2.1.1) is a web application for managing the client credentials needed for
connecting to the [Ed-Fi
ODS/API](https://docs.ed-fi.org/reference/ods-api-platform/) for HTTP-based
exchange of educational data. Version 2.1.1 specifically targeted Ed-Fi ODS/API
3.x, and it was built with .NET Core 3.1. These products were previously
supported by my development teams, and now have been deprecated.

.NET Core natively works in Linux, and Microsoft has provided SDK and runtime
images for Docker.We can quickly create a development environment for this
application, starting with the correct SDK tag:
`mcr.microsoft.com/dotnet/core/sdk:3.1`. Then, we want to support the following
tasks:

1. Build the solution and run unit tests
2. Run (database) integration tests
3. Run end-to-end tests
4. Run the application for exploratory testing

<div class="mermaid">
flowchart LR
    Build[Build + Unit Test] --> Integration
    Integration --> E2E[End to End]
    E2E --> Exploratory

    Exploratory --> Done{Done?}

    Done -->|Yes| Commit
    Done -->|No| Build
</div>

Since this article is about shifting left, we will not include containerization
_of the application itself_.

{: .alert .alert-success .mt-2 }
Review [Microsoft Container Registry](https://mcr.microsoft.com/) to find the
SDK, runtime, or other .NET images you may need.

{: .alert .alert-warning .mt-2 }
Many users, including your author, have had trouble pulling images from
Microsoft's registry, receiving error messages like this: `ERROR: failed to do
request: Head "https://mcr.microsoft.com/v2/dotnet/aspnet/manifests/8.0": EOF`.
This appears to be an unresolved bug in Docker Desktop or in Microsoft's web
server configuration, related to IPv6. [Turning off
IPv6](https://github.com/microsoft/containerregistry/issues/165) on your network
connection resolves the issue.

## The Build Environment

We need a .NET Core 3.1 SDK image, and we need to load the application files
into the image. Here is a good starting point, using Ubuntu 20. All commands
below will be shown relative to the `Ed-Fi-ODS-AdminApp/eng` directory.

```powershell
docker run -it --rm `
    -v ../Application:/opt/AdminApp/Application:rw `
    mcr.microsoft.com/dotnet/core/sdk:3.1.403-focal@sha256:b51325cd8b3eeb14099ca5db2a40bccc126bbb6fcaeec64fd208a73b8f800eec
```

This command runs in interactive mode (`-it`), dropping you into an active Bash
prompt. On exit, the container will be removed automatically (`--rm`). The
application source files are mapped using read-write mode (`:rw`)

 so that the `bin` and
`obj` directories that will be written by the build process.

{: .alert .alert-warning .mt-2 }
When using this statement in PowerShell scripts, replace `$pwd` with `$PSScriptRoot`.

## Build and Unit Test

Next, we'll want a script that runs the build and the unit tests. It will also
be nice to send the console log output to a file for easier review. Since this
is a .NET image, it contains PowerShell Core. Writing this in Bash would be
simple, but let's stick with PowerShell:

```powershell
Set-Location /opt/AdminApp/Application

$logFile = "../logs/build-$(Get-Date -Format "yyyyMMddHHmm").log"

dotnet build --nologo | Tee-Object -FilePath $logFile
dotnet test --nologo --filter FullyQualifiedName~UnitTests | Tee-Object -FilePath $logFile
```

Save this to a file (`run-build.ps1`), and map it into the running container.
Also, it will be convenient to create volume mounts for the logs and for the
NuGet packages; otherwise, both will disappear when the container exits. At the
end of the command we execute the file via `pwsh`. Finally, remove `-it` so that
the command belows runs the script and exits, instead of simply dropping you
into a terminal.

```powershell
docker run --rm `
    -v $pwd/../Application:/opt/AdminApp/Application:rw `
    -v $pwd/run-build.ps1:/opt/AdminApp/run-build.ps1:ro `
    -v $pwd/packages:/root/.nuget/packages:rw `
    -v $pwd/logs:/opt/AdminApp/logs:rw `
    mcr.microsoft.com/dotnet/core/sdk:3.1.403-focal@sha256:b51325cd8b3eeb14099ca5db2a40bccc126bbb6fcaeec64fd208a73b8f800eec `
    pwsh -File /opt/AdminApp/run-build.ps1
```

{: .alert .alert-success .mt-2 }
Future consideration:
1. The reader may want to explore using a [`dotnet test`
   logger](https://github.com/microsoft/vstest/blob/main/docs/report.md#available-test-loggers)
   for alternative output types.
2. The `run-build.ps1` script can also be used directly in a CI environment, so
   that you are running the exact same command in both the localhost and the
   automated environments.

## Integration Tests

### PostgreSQL Setup

This application's integration tests require [SQL Server 2019 (Docker
images)](https://hub.docker.com/r/microsoft/mssql-server) or [PostgreSQL
13](https://hub.docker.com/_/postgres), and we will need to install the database
tables. We will use PostgreSQL.

The integration test container will need to communicate with the database
container. To this end, we can create a docker network and run both containers
inside that network.

```powershell
docker network create adminapp

docker run --rm `
    --name postgres `
    --hostname postgres `
    --network adminapp `
    -e POSTGRES_PASSWORD=mysecretpassword `
    -d `
    postgres:13.20-alpine3.21@sha256:236985828131e95a12914071b944d0e0d21da5281312292747e222845f0ea670
```

### Table Installation

Next, we need to install the AdminApp database tables. Fortunately, this
application was previously containerized. The pre-built [database
image](https://github.com/Ed-Fi-Alliance-OSS/Ed-Fi-ODS-Docker/blob/v1.1.1/DB-Admin/Dockerfile)
is tagged as `edfialliance/ods-api-db-admin:v1.1.0`.

In development, we may need to modify the database. The Admin App SQL scripts
are _migration_ scripts. Any modifications we make will be new migrations, which
can run on top of the existing database. Furthermore, the Admin App repository
contains PowerShell scripts for installing the SQL migration scripts. With a
little experimentation, I was able to run the database migrations by executing
the following script inside the build container.

```powershell
Set-Location /opt/AdminApp

$config =
    @{
        "engine" = "PostgreSQL"
        "databaseServer" = "postgres"
        "databasePort" = "5432"
        "databaseUser" = "postgres"
        "databasePassword" = "mysecretpassword"
        "useIntegratedSecurity" = $false
        "adminDatabaseName" = "EdFi_Admin"
    }

$logFile = "./logs/dbup-$(Get-Date -Format "yyyyMMddHHmm").log"

./eng/run-dbup-migrations.ps1 $config | Tee-Object $logFile
```

{: .alert .alert-warning .mt-2 }
You may find small problems when running a PowerShell script in Linux that was
written and historically used in Windows: watch out for proper casing on file
names, since Linux cares about these things; change `\` to `/` or use
`Join-Path` to create file paths; and don't use `.exe` as an extension on
downloaded tools. I had to modify one of the existing PowerShell scripts as follows:

```powershell
$exePath = "$ToolsPath/$toolName.exe"
if ([System.Environment]::OSVersion.Platform -eq "Unix") {
    $exePath = "$ToolsPath/$toolName"
}
```

### Test Execution

The solution contains two integration test projects:
`EdFi.Ods.AdminApp.Management.Tests` and
`EdFi.Ods.AdminApp.Management.Azure.IntegrationTests`. We will skip the Azure
tests for now, focusing only on the "on-premises" (or fully containerized)
deployment path.

The `EdFi.Ods.AdminApp.Management.Tests` project contains an `appsettings.json`:

```javascript
{
    "AppSettings": {
        "AppStartup": "OnPrem",
        "ApiStartupType": "sandbox",
        "XsdFolder": "Schema",
        "DefaultOdsInstance": "DefaultOdsInstance",
        "DatabaseEngine": "SqlServer"
    },
    "ConnectionStrings": {
        "Admin": "Data Source=.\\;Initial Catalog=EdFi_Admin_Test;Integrated Security=True",
        "Security": "Data Source=.\\;Initial Catalog=EdFi_Security_Test;Integrated Security=True",
        "OdsEmpty": "Data Source=.\\;Initial Catalog=EdFi_Ods_Empty_Test;Integrated Security=True"
    }
}
```

One way to update these values is to [set environment
variables](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/configuration/?view=aspnetcore-9.0&viewFallbackFrom=aspnetcore-2.2#evcp),
which will override the appsettings file contents. Like so:

```powershell
$env:AppSettings__DatabaseEngine="PostgreSQL"
$env:ConnectionStrings__Admin="server=postgres;database=EdFi_Admin;username=postgres;password=$pgPass"
```

### Complete Integration Testing Scripts

We can call this one `run-integration.ps1`:

```powershell
Set-Location /opt/AdminApp

$pgPass="mysecretpassword"

$config =
    @{
        "engine" = "PostgreSQL"
        "databaseServer" = "postgres"
        "databasePort" = "5432"
        "databaseUser" = "postgres"
        "databasePassword" = $pgPass
        "useIntegratedSecurity" = $false
        "adminDatabaseName" = "EdFi_Admin"
    }

$logFile = "./logs/integration-$(Get-Date -Format "yyyyMMddHHmm").log"

./eng/run-dbup-migrations.ps1 $config | Tee-Object -FilePath $logFile

$env:AppSettings__DatabaseEngine="PostgreSQL"
$env:ConnectionStrings__Admin="server=postgres;database=EdFi_Admin;username=postgres;password=$pgPass"
$env:ConnectionStrings__Security="server=postgres;database=EdFi_Security;username=postgres;password=$pgPass"
$env:ConnectionStrings__OdsEmpty="server=postgres;database=EdFi_Ods_Empty_Test;username=postgres;password=$pgPass"

dotnet test --nologo Application/EdFi.Ods.AdminApp.Management.Tests | Tee-Object -Append -FilePath $logFile
```

And here is the final script to start this process in Docker:

```powershell
docker network create adminapp

docker run --rm `
    --name postgres `
    --hostname postgres `
    --network adminapp `
    -e POSTGRES_PASSWORD=mysecretpassword `
    -d `
    edfialliance/ods-api-db-admin:v1.1.0@sha256:258fab94ffbb49bc406b065b074a7154050dbdfaae2626d0570672317c575721

try {
    docker run --rm -it `
        -v $PSScriptRoot/../Application:/opt/AdminApp/Application:rw `
        -v $PSScriptRoot/run-integration.ps1:/opt/AdminApp/run-integration.ps1:ro `
        -v $PSScriptRoot/packages:/root/.nuget/packages:rw `
        -v $PSScriptRoot/logs:/opt/AdminApp/logs:rw `
        -v $PSScriptRoot/../eng:/opt/AdminApp/eng:rw `
        --network adminapp `
        mcr.microsoft.com/dotnet/core/sdk:3.1.403-focal@sha256:b51325cd8b3eeb14099ca5db2a40bccc126bbb6fcaeec64fd208a73b8f800eec `
        pwsh -File /opt/AdminApp/run-integration.ps1
}
finally {
    docker stop postgres
    docker network rm adminapp
}
```

And here's where the experiment goes ends: the integration test project is
hard-coded to SQL Server. Furthermore, due to licensing concerns, there is no
SQL Server base image for `edfialliance/ods-api-db-admin`. It is possible to
overcome this challenge, but not important: the basic point has been made.

## End-to-End Testing

Sadly, this application did not have any end-to-end tests when this version was
created. If it _had_ them, we might be able to start from the integration
testing script, which already sets up the database for testing. We would need to
inject background startup of the application. Then run the tests. The following
example is for manual execution after using `docker run --it` to start the
container and activate the command prompt.

```powershell
Set-Location /opt/AdminApp

$pgPass="mysecretpassword"

$config =
    @{
        "engine" = "PostgreSQL"
        "databaseServer" = "postgres"
        "databasePort" = "5432"
        "databaseUser" = "postgres"
        "databasePassword" = $pgPass
        "useIntegratedSecurity" = $false
        "adminDatabaseName" = "EdFi_Admin"
    }

$logFile = "./logs/integration-$(Get-Date -Format "yyyyMMddHHmm").log"

./eng/run-dbup-migrations.ps1 $config | Tee-Object -FilePath $logFile

$env:AppSettings__DatabaseEngine="PostgreSQL"
$env:ConnectionStrings__Admin="server=postgres;database=EdFi_Admin;username=postgres;password=$pgPass"
$env:ConnectionStrings__Security="server=postgres;database=EdFi_Security;username=postgres;password=$pgPass"
$env:ConnectionStrings__OdsEmpty="server=postgres;database=EdFi_Ods_Empty_Test;username=postgres;password=$pgPass"

# & at the end runs the application in the background
./Application/EdFi.Ods.AdminApp.Web/bin/Debug/netcoreapp3.1/EdFi.Ods.AdminApp.Web&

# Execute the tests
dotnet test ...

# Call `ps` to find the process ID of the background service
ps

# Now stop that service
kill <pid>
```

## Manual and Exploratory Testing

Startup a container with port mapping on port 8080, then run the script above up
through `EdFi.Ods.AdminApp.Web&`.

```powershell
# Assuming network was previously created
docker network create adminapp

docker run --rm `
    --name postgres `
    --hostname postgres `
    --network adminapp `
    -e POSTGRES_PASSWORD=mysecretpassword `
    -d `
    edfialliance/ods-api-db-admin:v1.1.0@sha256:258fab94ffbb49bc406b065b074a7154050dbdfaae2626d0570672317c575721

docker run -d `
    -v $PSScriptRoot/../Application:/opt/AdminApp/Application:rw `
    -v $PSScriptRoot/run-application.ps1:/opt/AdminApp/run-application.ps1:ro `
    -v $PSScriptRoot/packages:/root/.nuget/packages:rw `
    -v $PSScriptRoot/logs:/opt/AdminApp/logs:rw `
    -v $PSScriptRoot/../eng:/opt/AdminApp/eng:rw `
    --network adminapp `
    -p 8080:8080 `
    mcr.microsoft.com/dotnet/core/sdk:3.1.403-focal@sha256:b51325cd8b3eeb14099ca5db2a40bccc126bbb6fcaeec64fd208a73b8f800eec `
    pwsh -File /opt/AdminApp/run-application.ps1
```

Open <http://localhost:8080> in your browser for manually accessing the web
application. Then, don't forget to clean up when you're done:

```powershell
docker stop postgres
docker network rm adminapp
```
