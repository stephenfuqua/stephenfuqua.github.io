---
title: Getting Started with Infrastructure as Code in TeamCity
date: 2020-03-21
tags:
  - devops
  - tech
  - sdlc
---

[Infrastructure-as-code
(IaC)](https://www.ibm.com/cloud/learn/infrastructure-as-code) is the principle
of configuring systems through code instead of mouse clicks (cf [Packer Tips and
Lessons Learned](/archive/2018/03/10/packer-tips-and-lessons-learned) for
another example). TeamCity, the popular continuous-integration (CI) server from
JetBrains, enables IaC through writing scripts to interact with its [REST
API](https://www.jetbrains.com/help/teamcity/rest-api.html), or by [storing
projects settings in version
control](https://www.jetbrains.com/help/teamcity/storing-project-settings-in-version-control.html).
This article will share some lessons learned in using the [Kotlin
DSL](https://www.jetbrains.com/help/teamcity/kotlin-dsl.html) for project
settings. These will include:

1. What is Kotlin?
1. Benefits of using Kotlin
1. Learning Kotlin from TeamCity
1. Debugging before committing
1. Managing secure data
1. Connecting to forks

## What is Kotlin?

Kotlin is a language developed by JetBrains, maker of TeamCity. Originally
developed for the JVM, it is statically typed and compiled. JetBrains created a
Domain-Specific Language (DSL) for describing TeamCity builds: the TeamCity
Kotlin DSL. With this, all of the elements of a project -  build steps,
features, parameters, VCS roots, etc. -  are all defined in a relatively easy to
learn language, stored in a source control system (e.g. Git), and shareable
across multiple installations.

## Benefits of Using Kotlin

Some years ago, I had an architect that (quite rightly!) wanted the development
teams to treat TeamCity like it is code. The only problem is that we were still
clicking around in the user interface. Want to make a change to a build
configuration? Copy it, increment a version number, modify, have a reviewer look
at the audit history and confirm the output. This actually works reasonably
well, but involves a lot of mouse clicking for the reviewer and programmer
alike. And it is not transportable.

Build configurations in Kotlin can follow the standard software development life
cycle:

1. Develop in a text editor / IDE.
1. Compile and debug locally.
1. Test locally or on a test server.
1. Share a code branch for review by another programmer (e.g. through a GitHub
   pull request).
1. Deploy approved code to the production TeamCity server.

Each of these steps contains benefits in themselves. Add them together and you
have a powerful system for efficient management of TeamCity configurations. No
longer is it "treating TeamCity like code" -  it _is_ code.

## Learning Kotlin from TeamCity

While the [references](#references) at the bottom of this article can do much to
help with understanding Kotlin, the following tips will help you get started in
generating Kotlin configuration from _existing_ build configurations &mdash;
which is a much easier way to get started compared to learning how to write
TeamCity scripts from scratch.

### View Snippets in the UI

Many of the operations you can perform in the TeamCity web site ("the UI") will
let you view the Kotlin version of your change before committing that change.
This is a great way to begin learning how to work with the Kotlin DSL,
especially things like build features. The API documentation is of course
correct, but hard to translate into reality without seeing these working
examples.

Viewing an individual build configuration:

{: .center-block}
![screenshot: view build configuration as code](/images/tc-view-build-configuration-as-code.png){: .img-fluid .border .rounded}

Viewing a new build feature as code:

{: .center-block}
![screenshot: view new build feature as code](/images/tc-view-new-build-feature.png){: .img-fluid .border .rounded}

### Export an Entire Project

Likewise, you can start your first projects in the UI and learn from them,
instead of having to figure everything out from scratch. Take a project -
preferably a relatively simple one without dependencies in other projects - and
export it to Kotlin. Now you have a detailed example to study.

{: .center-block}
![screenshot: downloading entire project in kotlin](/images/tc-download-project-settings-in-kotlin.png){: .img-fluid .border .rounded}

### Internal Setting for Creating Smaller Files

If the project is large, you may want to split it into multiple files. Learning
how to do this from documentation or blog posts is no easy thing. Thankfully
[someone asked on
TeamCity](https://stackoverflow.com/questions/57763826/how-do-i-split-up-the-settings-kts-file-for-teamcitys-kotlin-configuration)],
and someone answered. The answer isn't entirely instructive, hence the
[section](#splitting-large-projects-into-separate-files) below. In particular,
to learn how to split up projects, see the answering author's comment about
setting the "internal settings" property
`teamcity.configsDsl.singleSettingsKts.maxNumberOfEntities` to something less
than 20 in TeamCity.

## Debugging Before Committing

### In the Text Editor / IDE

I've been doing all of my work in [Visual Studio
Code](https://code.visualstudio.com/) using the [Kotlin
extension](https://marketplace.visualstudio.com/items?itemName=fwcd.kotlin).
This extension gives you real-time analysis of basic syntax and semantics, which
goes a long way to detecting errors before trying to load your Kotlin scripts
into the UI. Other IDEs with built-in or extended support for Kotlin include
IntelliJ IDE, Android Studio, and Eclipse. I have not experimented with the
others, and so I cannot remark on comparable functionality (although I expect
IntelliJ at the least would have excellent support for the language, since it
too is made by TeamCity).

### Compiling with Maven

One problem with VS Code debugging is that it is not always obvious why
something is flagged as an error, and it does not catch all compilation errors.
For this, the Maven build tool is quite handy. If you're not a Java developer
you might not be familiar with maven. Thanks to a few random encounters with
Maven over the years, I recognized the pom.xml file that was included when I
exported a project. This file is similar to package.json or a csproj file. To
compile it, install Maven* and then run ` mvn teamcity-configs:generate` in the
directory containing the pom file. Read the debug output carefully and you'll be
on your way to fixing up most problems before you ever got to the UI.

{: .alert .alert-primary .mt-2 }
Windows users: see the appendix for notes on installing and configuring Maven.

Here's a sample error message, after I deliberately entered a typo in
the project name for the main `settings.kts` file:

```shell
> mvn teamcity-configs:generate

... skipping some of the output...
[ERROR] Error while generating TeamCity configs:
[ERROR] Compilation error settings.kts[33:15]: Unresolved reference: AdminAppProjecta
[INFO] ------------------------------------------------------------------------
[INFO] BUILD FAILURE
[INFO] ------------------------------------------------------------------------
... skipping remainder of the output...
```

On the second line, note that it mentions `Unresolved reference:
AdminAppProjecta`. The correct project name is in fact `AdminAppProject` without
the "a" at the end.

### Testing

Now that you know it compiles, it would be nice to test out your project /
modifications before updating your production server. TeamCity has made their
free [Professional Server](https://www.jetbrains.com/teamcity/buy/#new) quite
powerful. This is not a crippled demo. You can install this on your localhost or
a test/QA server. Push your DSL scripts to a branch or a fork (not the ones used
by your production server), sync your test instance of TeamCity, and test that
it really does what you think it does. Now create that pull request.

## Managing Secure Data

TeamCity has features for [managing
tokens](https://www.jetbrains.com/help/teamcity/storing-project-settings-in-version-control.html#StoringProjectSettingsinVersionControl-ManagingTokens)
that secure private data (e.g. api key, password, etc)  in your Kotlin scripts.
Personally, I prefer the other recommended approach mentioned in the above
article:

> "Alternatively, you can add a [password
> parameter](https://www.jetbrains.com/help/teamcity/typed-parameters.html#Adding-Parameter-Specification)
> with the secure value and use a
> [reference](https://www.jetbrains.com/help/teamcity/configuring-build-parameters.html#Using-Build-Parameters-in-Build-Configuration-Settings)
> to the parameter in the nested projects."

Since you want these values to be stored outside of source control, the twin
parameters can be setup at a higher level (perhaps in the root project). Each
installation of TeamCity will need to re-establish these twin parameters
manually. This is a good thing: you can have different credentials for a
QA-instance of TeamCity - which may be pointing to different source control
forks and to different deployment settings, for example - and production.

Example:

* `github.accessToken.secured = {your real access token}`
* `github.accessToken = %github.accessToken.secured%`

All subsequent references would use the shorter of the two. For example, you may
have a Git VCS root that needs to be access with secure credentials. If using
GitHub, you can use your [access token instead of your
password](https://help.github.com/en/github/authenticating-to-github/creating-a-personal-access-token-for-the-command-line)
when connecting to the API. In your TeamCity Kotlin file, setup the VCS root
like this:

```kotlin
    authMethod = password {
        userName = "%github.username%"
        password = "%github.accessToken%"
    }
```

The `github.username` would thus also be stored one level above the
source-controlled project, so that it too is not stored in source control.

## Connecting to Forks

In GitHub terminology, a "fork" is just a Git clone that is stored under another
organization/user's account. As described above, with Kotlin files stored in
version control you can create a robust lifecycle that includes testing a
configuration before pushing it to your production instance. One simple way to
manage this is with a personal fork. The following VCS root example uses the
access token approach and combines it with a GitHub organization or username
that is also stored at higher level in the project hierarchy, along with the
username and access token. The `branch` and `branchSpec` parameters would be set
in project, template, or buildType files.

```kotlin
package _Self.vcsRoots

import jetbrains.buildServer.configs.kotlin.v2019_2.*
import jetbrains.buildServer.configs.kotlin.v2019_2.vcs.GitVcsRoot

object FlightNodeApi : GitVcsRoot({
    name = "FlightNode.Api"
    url = "https://github.com/%github.organization%/FlightNode.Api.git"
    branch = "%git.branch.default%"
    branchSpec = "%git.branch.specification%"
    userNameStyle = GitVcsRoot.UserNameStyle.FULL
    checkoutSubmodules = GitVcsRoot.CheckoutSubmodules.IGNORE
    serverSideAutoCRLF = true
    useMirrors = false
    authMethod = password {
        userName = "%github.username%"
        password = "%github.accessToken%"
    }
})
```

## References

* [TeamCity Help: Kotlin DSL](https://www.jetbrains.com/help/teamcity/kotlin-dsl.html)
* [Configuration as Code, Part 1: Getting Started with Kotlin DSL](https://blog.jetbrains.com/teamcity/2019/03/configuration-as-code-part-1-getting-started-with-kotlin-dsl)
* [Configuration as Code, Part 2: Working with configuration scripts](https://blog.jetbrains.com/teamcity/2019/03/configuration-as-code-part-2-working-with-kotlin-scripts/)
* [Configuration as Code, Part 3: Creating build configurations dynamically](https://blog.jetbrains.com/teamcity/2019/04/configuration-as-code-part-3-creating-build-configurations-dynamically/)
* [Configuration as Code, Part 4: Extending Kotlin DSL](https://blog.jetbrains.com/teamcity/2019/04/configuration-as-code-part-4-extending-the-teamcity-dsl/)
* [Configuration as Code, Part 5: Using libraries](https://blog.jetbrains.com/teamcity/2019/04/configuration-as-code-part-5-using-dsl-extensions-as-a-library/)
* [Configuration as Code, Part 6: Testing configuration scripts](https://blog.jetbrains.com/teamcity/2019/05/configuration-as-code-part-6-testing-configuration-scripts/)
* [Stack Overflow: teamcity+kotlin](https://stackoverflow.com/questions/tagged/kotlin+teamcity)

## Appendix: Installing and Configuring Maven

The simplest way to install Maven is [with
chocolatey](https://www.chocolatey.org); if you don't already have it,
then follow that link to install it.

Do you have a Java Development Kit (JDK) installed? You will need one. I
typically use the package provided by Adopt OpenJDK - but not version 16, as
[there is a bug](https://youtrack.jetbrains.com/issue/KT-44624) when trying to
compile Kotlin.

```shell
> choco install -y adoptopenjdk12
```

Now you can install Maven:

```shell
> choco install -y maven
```

Before running Maven... if you are on a corporate network that has a custom root
security certificate, then you will need to install that into the Java keystore.

1. Open a *new* PowerShell prompt *AS ADMINISTRATOR*.
2. Check to see if the `JAVA_HOME` variable is already setup: does it display
   anything when you type `$env:JAVA_HOME` in PowerShell? If not, then...

   ```shell
   > $env:JAVA_HOME = "C:\Program Files\AdoptOpenJDK\jdk-12.0.2+10"
   ```

3. Run Java's `keytool` command with the following command. It will prompt you
   for a password; the default keystore password is `changeit`. If you don't
   know what that is, then it probably hasn't been changed from that default
   value :-D.

   ```shell
   > keytool -import -trustcacerts -alias root `
     -file C:\yourfile.cer -keystore $env:JAVA_HOME/lib/security/cacerts `
     -storepass changeit
   ```
