---
layout: page title: Splitting TeamCity Kotlin Into Multiple Files date:
2020-03-21 comments: true tags: [devops] sharing: true
---

I don't like having a single large file for a TeamCity project, which is the
default when exporting a project. It violates the Single Responsibility
Principle (SRP). For maintenance, I would rather find each element of interest
&mdash; whether a sub-project, template, build step, or vcs root &mdash; in its
own small file, so that I don't have to hunt inside a large file. And I would
rather add new files than modify existing ones.

[This note about non-portable
DSL](https://www.jetbrains.com/help/teamcity/kotlin-dsl.html#KotlinDSL-Non-PortableDSL)
explains the basic structure when you want to use multiple files. And yet I
never noticed it while hunting in detail for help on this topic a week ago; only just
stumbled on it while writing this blog piece. It seems to imply that using
multiple files is "non-portable," but apparently I _have_ been using the
portable DSL: "The portable format does not require specifying the uuid", which
I've not been doing. But there is a small risk that I could do something drastic
and lose my build history without a uuid. Since I also have server backups, I'm
not too worried.

When converting from a single portable script to multiple "non-portable"
scripts, be sure to set the package name correctly at the top of each file (for
C# developers, this is equivalent to setting the correct namespace). Otherwise
you will likely trip yourself up with compilation errors, unless you explictly
reference the package name in an import.

The official help page has the following sample `settings.kts` file:

```kotlin
import jetbrains.buildServer.configs.kotlin.v2019_2.*
import jetbrains.buildServer.configs.kotlin.v2019_2.buildSteps.script

version = "2020.1"

project {
  buildType {
    id("HelloWorld")
    name = "Hello world"
    steps {
        script {
            scriptContent = "echo 'Hello world!'"
        }
    }
  }
}
```

An approach to splitting this could result in the following structure:

.teamcity directory\
|-- _self\
&nbsp;&nbsp;&nbsp;|-- buildTypes\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|-- EchoHelloWorld.kt\
&nbsp;&nbsp;&nbsp;|-- Project.kt\
|-- pom.xml\
|-- settings.kts
{: .panel-body }
{: .panel .panel-default }

Three conventions to note here:

* Per the [Kotlin Coding
  Conventions](https://kotlinlang.org/docs/reference/coding-conventions.html),
  the directory names correspond to packages, the packages are named with
  `camelCase` rather than `PascalCase`, but the _file / class_ name is in
  `PascalCase`.
* Whereas the single file has the Kotlin script extension `.kts`, the individual
  files have plain `.kt`, except for `settings.kts`.
* Root-level project files are in the `_self` directory. The TeamCity help pages
  mention this as `_Self`, but I prefer `_self` as it reinforces the Kotlin
  coding convention.

The indivdiual files are shown below, not including `pom.xml`; there is no
reason to modify it. Note the package imports section, containing both local
packages and the jetbrains packages.

### EchoHelloWorld.kt

```kotlin
package _self.buildTypes

import jetbrains.buildServer.configs.kotlin.v2019_2.*
import jetbrains.buildServer.configs.kotlin.v2019_2.buildSteps.script

object EchoHelloWorld : BuildType ({
    id("HelloWorld")
    name = "Hello world"

    steps {
        script {
            scriptContent = "echo 'Hello world!'"
        }
    }
})
```

### Project.kt

I could have named this `HelloWorldProject.kt`, but `Project.kt` is short, simple,
and unambiguous in the root of the `Self` directory.

```kotlin
package _self

import jetbrains.buildServer.configs.kotlin.v2019_2.*
import jetbrains.buildServer.configs.kotlin.v2019_2.Project

object HelloWorldProject : Project({
    buildType(_self.buildTypes.EchoHelloWorld)
})
```

### settings.kts

```kotlin
import jetbrains.buildServer.configs.kotlin.v2019_2.*

version = "2020.1"
project(_self.HelloWorldProject)
```

## Enriching with a VCS Root

To further demonstrate, let's add a new file defining a Git VCS root. 

.teamcity directory\
|-- _self\
&nbsp;&nbsp;&nbsp;|-- buildTypes\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|-- EchoHelloWorld.kt\
&nbsp;&nbsp;&nbsp;|-- vcsRoots\
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|-- HelloWorldRepo.kt\
&nbsp;&nbsp;&nbsp;|-- Project.kt\
|-- pom.xml\
|-- settings.kts
{: .panel-body }
{: .panel .panel-default }

### HelloWorldRepo.kt

See the previous post's [Managing Secure
Data](/archive/2020/03/21/infrastructure-as-code-in-teamcity/#managing-secure-data)
section for important information on teh `accessToken` variable. Note that the
GitHub organization name is specified as a variable &mdash; allowing a developer
to test in a fork (substitute user's username for organization) before
submitting a pull reuqest.

```kotlin
package installer.vcsRoots

import jetbrains.buildServer.configs.kotlin.v2019_2.*
import jetbrains.buildServer.configs.kotlin.v2019_2.vcs.GitVcsRoot

object HelloWorldRepo : GitVcsRoot({
    name = "Hello-World"
    url = "https://github.com/%github.organization%/Hello-World.git"
    branch = "%git.branch.default%"
    userNameStyle = GitVcsRoot.UserNameStyle.NAME
    checkoutSubmodules = GitVcsRoot.CheckoutSubmodules.IGNORE
    serverSideAutoCRLF = true
    useMirrors = false
    authMethod = password {
        userName = "%github.username%"
        password = "%github.accessToken%"
    }
})
```