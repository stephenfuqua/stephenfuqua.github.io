---
layout: page
title: Docker Containers as Dev Environments
date: 2025-02-28
comments: true
tags:
- programming
- FlightNode
- architecture
sharing: true
excerpt_separator: <!--more-->
---

Have you ever needed to revisit an older application, and realized that you
don't have the SDK on your machine? Instead of installing the SDK locally, you
may be able to run the SDK in a [Docker container](https://www.docker.com).

## Revisiting a .NET Core 3.1 Application

The [Ed-Fi ODS Admin
App](https://github.com/Ed-Fi-Alliance-OSS/Ed-Fi-ODS-AdminApp/tree/v2.1.1)
(v2.1.1) is a web application for managing client credentials needed for
connecting to the [Ed-Fi
ODS/API](https://docs.ed-fi.org/reference/ods-api-platform/) for REST-based
exchange of educational data. Version 2.1.1 specifically targeted Ed-Fi ODS/API
3.x, and it was built with .NET Core 3.1. These products are supported by my
development teams.

.NET Core natively works in Linux, and Microsoft has provided SDK and runtime
images for Docker. And for this app, the team produced [a
Dockerfile](https://github.com/Ed-Fi-Alliance-OSS/Ed-Fi-ODS-Docker/blob/v1.1.1/Web-Ods-AdminApp/Dockerfile).
However, this was a runtime-only image, where the binaries were downloaded from
a NuGet package. Newer Ed-Fi Alliance repositories have dual Dockerfiles: a
production version built from NuGet packages, and a development version that
builds from source code, which is used locally and in CI testing.

We can quickly create a development environment for this application, starting
with the correct SDK tag: `mcr.microsoft.com/dotnet/core/sdk:3.1`. Then, we
want to support the following tasks:

1. Build the solution
2. Run unit tests
3. Run end-to-end tests
4. Create a NuGet package
5. Run the application for exploratory testing.

Let's do this all using the new [Bake file](https://docs.docker.com/build/bake/)
format.

:::warning

Many users, including your author, have had trouble pulling images from
Microsoft's registry, receiving error messages like this: `ERROR: failed to do
request: Head "https://mcr.microsoft.com/v2/dotnet/aspnet/manifests/8.0": EOF`.
This appears to be an unresolved bug in Docker Desktop or in Microsoft's web
server configuration, related to IPv6. [Turning off
IPv6](https://github.com/microsoft/containerregistry/issues/165) on your network
connection resolves the issue.

:::

## Revisiting a .NET 4.7.2 Application

Some years ago, I developed a data collection application for a non-profit
organization. I called the framework [FlightNode: A Platform for Avian
Conservation Monitoring](https://flightnode.github.io/). It was built on .NET
Framework 4.7.2 [for the REST
API](https://github.com/FlightNode/FlightNode.Api/tree/docker-2025)
(`docker-2025` branch) with Angular 1.x on the [front
end](https://github.com/FlightNode/FlightNode.Demo). And it _almost_ works in
Docker... but it was not worth the effort to try to fix everything.

First thing: you need [Mono](https://www.mono-project.com/) in order to work on
.NET 4.7.2 in a Linux-based container. Things might have worked out in a
[Windows
Container](https://learn.microsoft.com/en-us/virtualization/windowscontainers/quick-start/run-your-first-container),
but I have no interest in the extra configuration steps required to run Windows
inside of Windows.

:::warning

I tried multiple versions of Mono 6.x and was
unable to resolve a specific error (more on that below). Perhaps an even older
one would have worked in the end.

:::

Still, it was an interesting learning experience. To start, let's run an image
containing Mono, and load the `FlightNode.API` source code into it.

```powershell
# PowerShell
docker run -it --rm `
    -v $PSScriptRoot/src:/opt/FlightNode/src/:rw `
    -v $PSScriptRoot/test:/opt/FlightNode/test/:rw `
    -v $PSScriptRoot/packages:/opt/FlightNode/packages:rw `
    -v $PSScriptRoot/FlightNode.Api.sln:/opt/FlightNode/FlightNode.Api.sln:rw `
    mono:6.0.0.334@sha256:ffd791fd085cf5e782cdf27ad37e7ef3b302f4c7062c7ba2465cfe60590bd52a
```

:::tip

* `docker run -it --rm` means: run the docker image named at the end of this
  command in interactive (`-it`) mode, removing (`--rm`) the container when done
  using it.
* Mount four volumes (`-v <local path>:<container path>`): three directories and
  one file into the image, all in read-write mode. This gives the running
  container access to files hosted directly in your filesystem.
  * The `src` and `test` directories that contain the source code.
    * `/opt` is a good place to put your custom files.
  * The `packages` directory will contain downloaded NuGet packages. Storing
    this outside the container. Without this, the downloaded packages would
    disappear when the container stops running. With this, the downloaded
    packages are cached on your own filesystem.
  * And the .NET solution file, which exists in the parent directory of `src`
    and `test`.
* Finally, name the image to run: `mono` version 6.0.0.334. Pinning to the
  SHA256 digest is a safety feature ensuring that you only get exactly the same
  image every time, on every computer.

:::

The container includes Mono-based versions of `msbuild` and `nuget`, the core
applications needed to build the assemblies. The command above entered into the
container; the next command will run in Bash inside the running container.

```bash
#!/bin/bash

cd /opt/FlightNode
nuget restore FlightNode.Api.sln
msbuild FlightNode.Api.sln -m
```

Everything builds well. What about unit tests? This application used XUnit, and
at the time I only ever ran the tests from within Visual Studio. `msbuild` does
not have built-in capability of running tests, equivalent to today's `dotnet
test`. Thankfully the XUnit folks created their own console application,
`xunit.runner.console`. We can install and use it to run the unit tests.

```bash
#!/bin/bash

cd /opt/FlightNode

pushd packages
nuget install xunit.runner.console
popd

xunit=packages/xunit.runner.console.2.1.0/tools/xunit.console.exe
common=FlightNode.Common.UnitTests
dc=FlightNode.DataCollection.UnitTests
identity=FlightNode.Identity.UnitTests
api=FlightNode.Common.Api.UnitTests

mono $xunit test/$common/bin/Debug/$common.dll
mono $xunit test/$dc/bin/Debug/FlightNode.DataCollection.Domain.UnitTests.dll
mono $xunit test/$identity/bin/Debug/$identity.dll
mono $xunit test/$api/bin/Debug/FligthNote.Common.Api.UnitTests.dll
```

All unit tests are passing. Excellent news. Now will the application run?

```bash
#!/bin/bash

mono src/FlightNode.SelfHost/bin/Debug/FlightNode.SelfHost.exe

#### OUTPUT:

[ERROR] FATAL UNHANDLED EXCEPTION: System.Reflection.TargetInvocationException: Exception has been thrown by the target of an invocation. ---> System.TypeLoadException: Could not load type of field 'Microsoft.Owin.Security.DataProtection.DpapiDataProtector:_protector' (0) due to: Could not resolve type with token 0100000a from typeref (expected class 'System.Security.Cryptography.DpapiDataProtector' in assembly 'System.Security, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b03f5f7f11d50a3a') assembly:System.Security, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b03f5f7f11d50a3a type:System.Security.Cryptography.DpapiDataProtector member:(null)
```

☹️. Negative, there is a problem. Cryptography: one shouldn't be surprised that
there is something different going on when trying to run in Linux with mono.
[This StackOverflow](https://stackoverflow.com/a/23946374/30384) post provides
an idea of how to resolve this. Since the purpose is a demonstration of the use
(and perhaps limitations) of Docker, we will end the experiment here, drawing a
few conclusions:

1. The mono project provides the basic tools for resurrecting a .NET Framework
   app running in a Linux-based container.
2. But it might not be sufficient as-is in all cases.
3. And you might need to find additional tools, such as the XUnit console runner
   cited above.
