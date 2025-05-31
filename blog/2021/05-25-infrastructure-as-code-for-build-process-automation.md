---
title: Infrastructure as Code for Continuous Integration
date: 2021-05-21
tags:
  - devops
  - tech
  - sdlc

---

"Infrastructure as Code", or IaC if you prefer <abbr title="Three Letter
Acronyms">TLAs</abbr>, is the practice of configuring infrastructure
components in text files instead of clicking around in a user interface. Last
year I wrote a few detailed articles on IaC with TeamCity
([1](/archive/2020/03/21/infrastructure-as-code-in-teamcity/),
[2](/archive/2020/03/22/splitting-teamcity-kotlin-into-multiple-files/),
[3](/archive/2020/08/08/teamcity-kotlin-template-inheritance/)). Today I want
take a step back and briefly address the topic more broadly, particularly with
respect to continuous integration (CI) and delivery (CD): the process of
automating software compilation, testing, quality checks, packaging, deployment,
and more.

<!-- truncate -->

## Continuous Integration and Delivery Tools

To level set, this article is about improving the overall developer and
organizational experience of building (integration) and deploying (delivery)
software on platforms such as:

* Your local workstation
* Ansible
* Azure DevOps
* CircleCI
* CruiseControl
* GitHub Actions
* GitLab
* GoCD
* Jenkins
* Octopus Deploy
* TeamCity
* TravisCI

Personally, I have some experience with perhaps half of these. While I believe
the techniques discussed are widely applicable, I do not know the details in all
cases. Please look carefully at your toolkit to understand its advantages and
limitations.

## Philosophy

### Why?

Many tools provide useful <abbr title="Graphical User Interface">GUI</abbr>s
that allow you to, more-or-less quickly, setup a CI/CD process through point,
click, and typing in some small attributes like project name. Until you get used
to it, writing code instead of clicking might actually take longer. So why do
it?

* Repeatability - what happens when you need to transfer the instructions to
  another computer/server? Re-apply a text file vs. click around all over again.
* Source control:
  * Keep build configuration along with the application source code.
  * Easily revert to a prior state.
  * Sharing is caring.
* Peer review - much easier to review a text file (especially changes!) than
  look around in a GUI.
* Run locally - might be nice to run the automated process locally before
  committing source code changes.
* Testing - or the flip side, might be nice to test the automation process
  locally before putting it into the server.
* Documentation - treat the code as documentation.

### Programming Style

The code in an IaC might project might not be executable (_imperative_); it may
instead be _declarative_ configuration that that describes the desired state and
lets the tool figure out how to achieve it. Examples of each:

* **Imperative**: Bash, Python, PowerShell, Kotlin (a bit of a hybrid), HCL, etc
* **Declarative**: JSON, YAML, XML, ini, proprietary, etc

Which style, and which type of file (bash vs. powershell, json vs xml) will
largely depend on the application you are interacting with and your general
objectives. Often times you won't get to choose between them. Many tasks can rely
on declarative configuration, especially using
[YAML](https://en.wikipedia.org/wiki/YAML). But that is not well suited for tasks
like setting up a remote service through API calls, which might require
scripting in an imperative language.

### Universalizing

Every platform has its own approach. Following the simplest path, you can often
get up-and-running with a build configuration in the tool very quickly &mdash; but
that effort will not help you if you need to change tools or if you want to run
the same commands on your development workstation.

How do you avoid vendor lock-in? "Universalize" &mdash; create a process that can be
transported to any tool with ease. This likely means writing imperative scripts.

<div class="image">
![Image of NUnit configuration with caption "how do i run this locally?"](/img/iac-how-do-i-run-this-locally.jpg)
</div>

The screenshot above is from TeamCity, showing a build runner step for running
NUnit on a project. A developer who does not know how to run NUnit at the
command line will not be able to learn from this example. Furthermore, the
configuration process in another tool may look completely different. Instead of
using hte "NUnit runner" in TeamCity, we can write a script and put it in the
source code repository. Since NUnit is a .NET unit testing tool, and most .NET
development is done on Windows systems, PowerShell is often a good choice for
this sort of script. Configuring TeamCity (or Jenkins, etc) to run that script
should be trivial and easy to maintain.

### Examples of IaC Tools and Processes

While this article is about continuous integration and delivery, it is worth
noting the many different types of tools that support an IaC mindset. Here is a
partial list of tools, with the configuration language in parenthesis.

* IIS: web.config, applicationHost.config (XML)
* Containers: Dockerfiles, Docker Compose, Kubernetes (YAML, often calling
  imperative scripts)
* VM Images: Packer (JSON or HCL)
* Configuration:  Ansible (YAML), AWS CloudFormation (JSON), Terraform (JSON or
  HCL), Puppet, Salt, Chef, and so many more.
* Network Settings: firewalls, port configurations, proxy servers, etc. (wide
  variety of tools and styles)

Generally, these tools use declarative configuration scripts that are composed
by hand rather than through a user interface, although there are notable
exceptions (such as IIS's `inetmgr` GUI).

At some point, vendor lock-in does happen: there are no tools (that I know of)
for defining a job with a universal language that applies to all of the relevant
platforms. TerraForm might come the closest. There are also some tools that can
define continuous integration processes generically and output scripts for
configuring several different platforms. For better or worse, I tend to be leary
of getting _too_ far away from the application's native configuration code, for
fear that I'll miss out on important nuances.

## Real World Examples of Continuous Integration Scripts

### PowerShell and .NET

Command line examples using [Ed-Fi ODS AdminApp's build.ps1
script](https://github.com/Ed-Fi-Alliance-OSS/Ed-Fi-ODS-AdminApp/blob/main/build.ps1):

```powershell
./build.ps1 build -BuildConfiguration release -Version "2.0.0" -BuildCounter 45
./build.ps1 unittest
./build.ps1 integrationtest
./build.ps1 package -Version "2.0.0" -BuildCounter 45
./build.ps1 push -NuGetApiKey $env:nuget_key
```

Any of those commands can easily be run in any build automation tool. What are
these commands doing? The first command is for the `build` operation, and it
calls function `Invoke-Build`:

```powershell
function Invoke-Build {
    Write-Host "Building Version $Version" -ForegroundColor Cyan

    Invoke-Step { InitializeNuGet }
    Invoke-Step { Clean }
    Invoke-Step { Restore }
    Invoke-Step { AssemblyInfo }
    Invoke-Step { Compile }
}
```

Side-note: `Invoke-Step` seen here, and `Invoke-Execute` seen below, are custom
functions that (a) create a domain-specific language for writing a build script,
and (b) setup command timing and logging to the console for each operation.

This function in turn is calling a series of other functions. If you are a .NET
developer, you'll probably recognize these steps quite readily. Let's peak into
the last function call:

```powershell
function Compile {
    Invoke-Execute {
        dotnet --info
        dotnet build $solutionRoot -c $Configuration --nologo --no-restore

        $outputPath = "$solutionRoot/EdFi.Ods.AdminApp.Web/publish"
        $project = "$solutionRoot/EdFi.Ods.AdminApp.Web/"
        dotnet publish $project -c $Configuration /p:EnvironmentName=Production -o $outputPath --no-build --nologo
    }
}
```

Now we see the key operations for compilation. In this is specific case, the
development team actually wanted to run two commands, and even before running
them they wanted to capture log output showing the version of `dotnet` in use.
Any developer can easily run the build script to execute the same sequence of
actions, without having to remember the detailed command options. And any tool
should be able to run a PowerShell script with ease.

### Python

Command line examples using [LMS-Toolkit's
build.py](https://github.com/Ed-Fi-Alliance-OSS/LMS-Toolkit/blob/main/eng/build.py):

```bash
python ./build.py install schoology-extractor
python ./build.py test schoology-extractor
python ./build.py coverage schoology-extractor
python ./build.py coverage:html schoology-extractor
```

As the project in question (LMS Toolkit) is a set of Python scripts, and because
we wanted to use a scripting language that is well supported in both Windows and
Linux, we decided to use Python instead of a shell script.

There is a helper function for instructing the Python interpreter to run a shell
command:

```python
def _run_command(command: List[str], exit_immediately: bool = True):

    print('\033[95m' + " ".join(command) + '\033[0m')

    # Some system configurations on Windows-based CI servers have trouble
    # finding poetry, others do not. Explicitly calling "cmd /c" seems to help,
    # though unsure why.

    if (os.name == "nt"):
        # All versions of Windows are "nt"
        command = ["cmd", "/c", *command]

    script_dir = os.path.dirname(os.path.realpath(sys.argv[0]))

    package_name = sys.argv[2]

    package_dir = os.path.join(script_dir, "..", "src", package_name)
    if not os.path.exists(package_dir):
        package_dir = os.path.join(script_dir, "..", "utils", package_name)

        if not os.path.exists(package_dir):
            raise RuntimeError(f"Cannot find package {package_name}")

    result = subprocess.run(command, cwd=package_dir)

    if exit_immediately:
        exit(result.returncode)

    if result.returncode != 0:
        exit(result.returncode)
```

And then we have the individual build operations, such as running unit tests
with a code coverage report:

```python
def _run_coverage():
    _run_command([        "poetry",
        "run",
        "coverage",
        "run",
        "-m",
        "pytest",
        "tests",
    ], exit_immediately=False)
    _run_command([        "poetry",
        "run",
        "coverage",
        "report",
    ], exit_immediately=False)
```

Reading this is a little strange at first, because the Python `subprocess.run`
function is expecting an array of commands rather than a single string. Hence
the command `poetry run coverage report` becomes the array `["poetry", "run",
"coverage", "report"]`. But here's the thing: once you write the script, anyone
can run it repeatedly, on any system that has the necessary tools installed,
without having to learn and remember the detailed syntax of the commands that
are being executed under the hood.

### TypeScript

The JavaScript / TypeScript world provides `npm`, which is a great facility for
running build operations.

Using [Ed-Fi Project
Buzz](https://github.com/Ed-Fi-Exchange-OSS/EdFi-Project-Buzz), you can run
commands like the following:

```powershell
npm install
npm run build
npm run test
npm run test:ci
```

The `npm run XYZ` commands are invoking scripts defined in the package.json file:

```javascript
{
    "build": "nest build && copyfiles src/**/*.graphql dist",
    "test": "jest",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:ci": "SET CI=true && SET TEAMCITY_VERSION = 1 && yarn test --testResultsProcessor=jest-teamcity-reporter--reporters=jest-junit",
}
```

Look at that debug command! Imagine having to type that in manually instead of
just running `npm run test:debug`. Yuck!

## Real World Examples of Tool Automation Scripts

That is, examples of scripts for automating the _software_ that will run the
integration and/or delivery process.

### Octopus Deploy Operations

I can distinctly recall seeing advertisements for Octopus Deploy that castigated
the use of YAML. While they have long supported JSON import and export of
configurations, those JSON files were not very portable: they could only
interoperate with the same Octopus version that created them.

Octopus has been coming around to [deployment process as
code](https://octopus.com/docs/deployments/patterns/deployment-process-as-code).
It appears that they're embracing the philosophy extolled in this article. The
referenced article doesn't give examples of how to work with Octopus itself;
instead it just tells you to use the .NET SDK. Which is what we've done in the
example below. _Also of note_: as of May 2021, the
[roadmap](https://octopus.com/company/roadmap) shows that Git-integration is
under development. This feature would, if I understand correctly, enable changes
in the Octopus Deploy UI to be saved directly into Git source control. That's a
great step! I do not see any indication of what language will be used or whether
changes can be scripted and then picked up by Octopus Deploy instead of vice
versa.

In the [Ed-Fi ODS/API
application](https://github.com/Ed-Fi-Alliance-OSS/Ed-Fi-ODS-Implementation/blob/v7.3/logistics/scripts/modules/octopus-deploy-management.psm1)
there's a PowerShell script that imperatively creates channels and releases, and
deploys releases, on Octopus Deploy &mdash; all without having to click around
in the user interface. The following example imports the module; runs a command
to install the Octopus command line client (typically a one-time operation), and
then it creates a new deployment channel:

```powershell
$ Import-Module octopus-deploy-management.psm1
$ Install-OctopusClient
$ $parms = @{
     ServerBaseUrl="https://..."
     ApiKey="API-............"
     Timeout=601
     Project="Ed-Fi ODS Shared Instance (SQL Server)"
     Channel="testing"
  }
$ Invoke-OctoCreateChannel @parms
```

And here's the body of the `Invoke-OctoCreateChannel` function, which is running the .NET SDK command line tool:

```powershell
$params = @(
    "--project", $Project,
    "--channel", $Channel,
    "--update-existing",
    "--server", $ServerBaseUrl,
    "--apiKey", $ApiKey,
    "--timeout", $Timeout
)

Write-Host -ForegroundColor Magenta "& dotnet-octo create-channel $params"
&$ToolsPath/dotnet-octo create-channel $params
```

### TeamCity

TeamCity build configurations can be automated with either XML or Kotlin. The
latter is my preferred approach, and I've talked about it in three prior blog posts:

1. [Getting Started with Infrastructure as Code in
   TeamCity](/archive/2020/03/21/infrastructure-as-code-in-teamcity/)
1. [Splitting TeamCity Kotlin Into Multiple
   Files](/archive/2020/03/22/splitting-teamcity-kotlin-into-multiple-files/)
1. [Template Inheritance with TeamCity
   Kotlin](/archive/2020/08/08/teamcity-kotlin-template-inheritance/)

### GitHub Actions

Intrinsically YAML-driven, the following example from the [Ed-Fi LMS
Toolkit](https://github.com/Ed-Fi-Alliance-OSS/LMS-Toolkit/blob/main/.github/workflows/publish-canvas.yml)
demonstrates the use of the [Python](#python) script that is described above. For brevity's sake I've
removed steps that prepare the container by setting up the right version of Python and performing some other optimization activities.

```yaml
# SPDX-License-Identifier: Apache-2.0
# Licensed to the Ed-Fi Alliance under one or more agreements.
# The Ed-Fi Alliance licenses this file to you under the Apache License, Version 2.0.
# See the LICENSE and NOTICES files in the project root for more information.

name: Canvas Extractor - Publish
on:
  workflow_dispatch

jobs:
  publish-canvas-extractor:
    name: Run unit tests and publish
    runs-on: ubuntu-20.04
    steps:
      - name: Checkout code
        uses: actions/checkout@5a4ac9002d0be2fb38bd78e4b4dbde5606d7042f

        ...

      - name: Install Python Dependencies
        run: python ./eng/build.py install canvas-extractor

        ...

      - name: Run Tests
        run: python ./eng/build.py test canvas-extractor

      - name: Publish
        env:
          TWINE_USERNAME: ${{ secrets.TWINE_USERNAME }}
          TWINE_PASSWORD: ${{ secrets.TWINE_PASSWORD }}
        run: python ./eng/build.py publish canvas-extractor
```

## Conclusion

Taking the approach of Infrastructure-as-Code is all about shifting from a
point-and-click mindset to a programming mindset, with benefits such as source
control, peer review, and repeatability. Most continuous integration and
delivery tools will support this paradigm. Many tools offer specialized commands
that hide some of the complexity of running a process. While these can get you
up-and-running quickly, over-utilization of such commands can lead to a
tightly-coupled system, making it painful to move to another system. Scripted
execution of integration and delivery steps ("universalizing") can lead to more
loosely-coupled systems while also enabling developers to run the same commands
locally as would run on the CI/CD server.

## References

Useful references for learning more about Infrastructure-as-code:

* [DevOps.com: Version your
  infrastructure](https://devops.com/version-your-infrastructure/)
* [Continuous Integration, by Paul Duvall, Steve Matyas, and Andrew
  Glover](https://martinfowler.com/books/duvall.html)
* [Infrastructure as Code, by Kief
  Morris](https://infrastructure-as-code.com/book/)

More generally, the use of IaC represents a "DevOps mindset": developers
thinking more about operations, and operations acting more like developers. To
the benefit of both. Good DevOps references include:

* [WikiPedia: DevOps](https://en.wikipedia.org/wiki/DevOps)
* [The Origins of DevOps: What’s in a
  Name?](https://devops.com/the-origins-of-devops-whats-in-a-name/)
* [The Phoenix Project, by Kevin Behr, George Spafford, and Gene
  Kim](https://itrevolution.com/book/the-phoenix-project/)
* [The DevOps Handbook: How to Create World-Class Agility, Reliability, &
  Security in Technology Organizations, by Gene Kim, Jez Humble, John Wilis, and
  Patrick Deboi](https://itrevolution.com/book/the-devops-handbook/)
* [Continuous Delivery, Jez Humble’s personal
  site](https://continuousdelivery.com/)

## License

All code samples shown here are from projects manged by the [Ed-Fi
Alliance](https://www.ed-fi.org), and are used under the terms of the [Apache
License, version 2.0](https://github.com/Ed-Fi-Alliance-OSS/Ed-Fi-ODS-Implementation/blob/v7.3/LICENSE.txt).
