---
title: Template Inheritance with TeamCity Kotlin
date: 2020-08-08
tags:
  - devops
  - tech
  - sdlc
sharing: true

---

This summer, one of the development teams at the Ed-Fi Alliance has been hard at
work building Project Buzz: "When school shutdowns went into effect across the
country as a result of COVID-19, much of the information teachers need to
support students in the new online-school model had become fragmented across
multiple surveys and the Student Information System." ([Fix-It-Fridays Delivers Project Buzz, A Mobile App
to Help Teachers Prepare for
Back-to-School](https://www.ed-fi.org/blog/2020/07/fix-it-fridays-delivers-project-buzz-a-mobile-app-to-help-teachers-prepare-for-back-to-school/)).

As project architect, my role has been one of support for the development team,
guiding technology toolkit choices and supporting downstream build and
deployment operations. The team agreed to develop the applications in TypeScript
on both the front- and back-ends. My next challenge: rapidly create TeamCity
build configurations for all components using Kotlin code.

<!-- truncate -->

## Components

At this time, there are four components to the software stack: database, API,
GUI, and ETL. The project is available under the Apache License, version 2, [on
GitHub](https://github.com/Ed-Fi-Exchange-OSS/EdFi-Project-Buzz). The build
configurations for these four are generally very similar, although there are
some key differences. This gave me a great opportunity to explore the power of
creating abstract base classes in TeamCity for sharing baseline settings among
several templates and build configurations.

## Requirements

1. Minimize duplication
2. Drive configurations through scripts that also operate at the command line,
   so that developers can easily execute the same steps as TeamCity.
3. The above item implies use of script tasks. When those scripts emit an error
   message, that message should trigger the entire build to fail.
4. All build configurations should check for sufficient disk space before running.
5. All build configurations should use the same Swabra settings.
6. All build configurations will need access to the VCS root, and the Kotlin
   files will be in the same repository as the rest of the source code.
7. All projects will need build steps for pull requests and for the default
   branch.
   * Pull requests should run build and test activities
   * Default branch should run build, test, and package activities, and then
     trigger deployment.
8. Both branch and pull request triggers should operate only when the given
   component is modified. For example, a pull request for the database
   project should not trigger the build configurations for the API, GUI, or ETL
   components.
9. Pull requests should publish information back to GitHub so that the reviewer
   will know the status of the build operation.

## Classes

![Class diagram](/images/kotlin-template-base-classes-1.png)

### BuildBaseClass

The most general settings are applied in class `BuildBaseClass`, covering
requirements 3, 4, 5, 6, and the commonalities in the two branches of
requirement 7.

#### Structure of BuildBaseClass

Note that only the required imports are present. The class is made abstract via
the `open class` keywords in the signature.

```kotlin
package _self.templates

import jetbrains.buildServer.configs.kotlin.v2019_2.*
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.freeDiskSpace
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.swabra
import jetbrains.buildServer.configs.kotlin.v2019_2.buildSteps.powerShell

open class BuildBaseClass : Template({
    // contents are split up and discussed below
})
```

#### Requirement 3: Fail on Error Message

It took me a surprisingly long time to discover this. PowerShell build steps in
TeamCity behave a little differently than one might expect. You can set them to
format StdErr as an error message, and it is natural to assume an error message
will cause the build to fail. Not true. This setting helps, but as will be seen
below, is not actually sufficient.

```kotlin
open class BuildBaseClass : Template({
    // ...

    option("shouldFailBuildOnAnyErrorMessage", "true")

    // ...
})
```

#### Requirements 4 and 5: Free Disk Space and Swabra

Apply two build features: check for minimum available disk space, and use the
Swabra build cleaner.

```kotlin
open class BuildBaseClass : Template({
    // ...

    features {
        freeDiskSpace {
            id = "jetbrains.agent.free.space"
            requiredSpace = "%build.feature.freeDiskSpace%"
            failBuild = true
        }
        // Default setting is to clean before next build
        swabra {
        }
    }

    // ...
})
```

#### Requirement 6: VCS Root

Use the special VCS root object, `DslContext.settingsRoot`. Checkout rules are
applied via parameter so that each component's build type will be able to
specify a rule for checking out only that component's directory, thus preventing
triggering on updates to other components.

```kotlin
open class BuildBaseClass : Template({
    // ...

    vcs {
        root(DslContext.settingsRoot, "%vcs.checkout.rules%")
    }

    // ...
})
```

#### Requirement 7: Shared Build Steps

The database project, which deploys tables into a PostgreSQL database, does not
have any tests. Therefore this base class contains only the following build
steps, without a testing step:

1. Install and Use Correct Version of Node.js
2. Install Packages
3. Build

That first step supports TeamCity agents that need to use different versions of
Node.js for different projects, using [nvm for
Windows](https://github.com/coreybutler/nvm-windows). The second executes `yarn
install` and the third executes `yarn build`. Because the TeamCity build agents
are on Windows, all steps are executed using PowerShell.

```kotlin
open class BuildBaseClass : Template({
    // ...

    steps {
        powerShell {
            name = "Install and Use Correct Version of Node.js"
            formatStderrAsError = true
            scriptMode = script {
                content = """
                    nvm install %node.version%
                    nvm use %node.version%
                    Start-Sleep -Seconds 1
                """.trimIndent()
            }
        }
        powerShell {
            name = "Install Packages"
            workingDir = "%project.directory%"
            formatStderrAsError = true
            scriptMode = script {
                content = """
                    yarn install
                """.trimIndent()
            }
        }
        powerShell {
            name = "Build"
            workingDir = "%project.directory%"
            formatStderrAsError = true
            scriptMode = script {
                content = """
                    yarn build
                """.trimIndent()
            }
        }
    }

    // ...
})
```

### BuildOnlyPullRequestTemplate

#### Structure of BuildOnlyPullRequestTemplate

Once again, the structure below contains only the required imports for this
class. Carefully note the brace style: in the abstract class, the class
"contents" were all inside braces as an argument to the `Template` constructor.
In this concrete class, the "contents" are inside an `init` method, which is in
turn inside a code block outside the `BuildBaseClass` constructor. You can learn
more about this in the [Kotlin: Classes and
Inheritance](https://kotlinlang.org/docs/reference/classes.html) documentation.

This class inherits directly from `BuildBaseClass` and does not need to apply
any additional build steps.

```kotlin
package _self.templates

import jetbrains.buildServer.configs.kotlin.v2019_2.*
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.commitStatusPublisher
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.PullRequests
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.pullRequests
import jetbrains.buildServer.configs.kotlin.v2019_2.triggers.VcsTrigger

object BuildOnlyPullRequestTemplate : BuildBaseClass() {
    init {
        name = "Build Only Pull Request Node.js Template"
        id = RelativeId("BuildOnlyPullRequestTemplate")

        // Remainder of the contents are split up and discussed below
    }
}
```

#### Requirement 8: Pull Request Triggering

Here I am attempting to use the Pull Request build feature. I have had trouble
getting it to work as advertised. This configuration needs further tweking, to
ensure that only repository members' pull requests automatically trigger a build
(do not want random people submitting random code in a pull request, which might
execute malicious statements on my TeamCity agent). I need to try changing that
branch filter to `+:pull/*`.

```kotlin
object BuildOnlyPullRequestTemplate : BuildBaseClass() {
    init {

        // ...

        triggers {
            vcs {
                id ="vcsTrigger"
                quietPeriodMode = VcsTrigger.QuietPeriodMode.USE_CUSTOM
                quietPeriod = 120
                // This allows triggering on "anything" and then removes
                // triggering on the default branch and in feature branches,
                // thus leaving only the pull requests.
                branchFilter = """
                    +:*
                    -:<default>
                    -:refs/heads/*
                """.trimIndent()
            }
        }
        features {
            pullRequests {
                vcsRootExtId = "${DslContext.settingsRoot.id}"
                provider = github {
                    authType = token {
                        token = "%github.accessToken%"
                    }
                    filterTargetBranch = "+:<default>"
                    filterAuthorRole = PullRequests.GitHubRoleFilter.MEMBER_OR_COLLABORATOR
                }
            }
        }

        // ...

    }
}
```

#### Requirement 9: Publishing Build Status

This uses the Commit Status Publisher. Note that the `authType` is
`personalToken` here, whereas it was just `token` above. I have no idea why this
is different ¯\\_(ツ)_/¯.

```kotlin
object BuildOnlyPullRequestTemplate : BuildBaseClass() {
    init {

        // ...

        features {
            commitStatusPublisher {
                publisher = github {
                    githubUrl = "https://api.github.com"
                    authType = personalToken {
                        token = "%github.accessToken%"
                    }
                }
            }
        }

        // ...

    }
}
```

### PullRequestTemplate

Unlike the class described above, this one needs to run automated tests.
Unfortunately, it demonstrates my (current) inability to avoid some degree of
duplication. Perhaps in a future iteration I'll rethink the inheritance tree and
find a solution. For now, it duplicates features shown above, with the only
difference being the base class: it inherits from `BuildAndTestBaseClass`, shown
next, instead of `BuildBaseClass`.

### BuildAndTestBaseClass

This simple class inherits from `BuildBaseClass` and adds two steps: run tests
using the `yarn test:ci` command and run quality inspections using command `yarn
lint:ci`.

```kotlin
package _self.templates

import jetbrains.buildServer.configs.kotlin.v2019_2.*
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.freeDiskSpace
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.swabra
import jetbrains.buildServer.configs.kotlin.v2019_2.buildSteps.powerShell

open class BuildAndTestBaseClass : BuildBaseClass() {
    init {
        steps {
            powerShell {
                name = "Test"
                workingDir = "%project.directory%"
                formatStderrAsError = true
                scriptMode = script {
                    content = """
                        yarn test:ci
                    """.trimIndent()
                }
            }
            powerShell {
                name = "Style Check"
                workingDir = "%project.directory%"
                formatStderrAsError = true
                scriptMode = script {
                    content = """
                        yarn lint:ci
                    """.trimIndent()
                }
            }
        }
    }
}
```

### BuildAndTestTemplate

Based on `BuildAndTestBaseClass`, this class adds a build step for packaging,
and artifact rule, and a trigger. Although these are TypeScript packages, the
build process is using NuGet packaging in order to take advantage of other tools
(NuGet package feed, Octopus Deploy). The packaging step is orchestrated with a
PowerShell script. The configuration can be used for any branch, but it is only
triggered by the default branch.

```kotlin
package _self.templates

import jetbrains.buildServer.configs.kotlin.v2019_2.*
import jetbrains.buildServer.configs.kotlin.v2019_2.buildFeatures.freeDiskSpace
import jetbrains.buildServer.configs.kotlin.v2019_2.buildSteps.powerShell
import jetbrains.buildServer.configs.kotlin.v2019_2.triggers.VcsTrigger
import jetbrains.buildServer.configs.kotlin.v2019_2.triggers.vcs

object BuildAndTestTemplate : BuildAndTestBaseClass() {
    init {
        name = "Build and Test Node.js Template"
        id = RelativeId("BuildAndTestTemplate")

        artifactRules = "+:%project.directory%/eng/*.nupkg"

        steps {
            // Additional packaging step to augment the template build
            powerShell {
                name = "Package"
                workingDir = "%project.directory%/eng"
                formatStderrAsError = true
                scriptMode = script {
                    content = """
                        .\build-package.ps1 -BuildCounter %build.counter%
                    """.trimIndent()
                }
            }
        }

        triggers {
            vcs {
                id ="vcsTrigger"
                quietPeriodMode = VcsTrigger.QuietPeriodMode.USE_CUSTOM
                quietPeriod = 120
                branchFilter = "+:<default>"
            }
        }
    }
}
```

## Component-Specific Projects

Bringing this all together, each components is a stand-alone project and
contains at least two build types: Branch and Pull Request. These respectively
utilize the appropriate template. The parameters are defined on the sub-project,
making the build types extremely small:

#### BranchAPIBuild

```kotlin
package api.buildTypes

import jetbrains.buildServer.configs.kotlin.v2019_2.*

object BranchAPIBuild : BuildType ({
    name = "Branch Build and Test"
    templates(_self.templates.BuildAndTestTemplate)

})
```

#### PullRequestAPIBuild

```kotlin
package api.buildTypes

import jetbrains.buildServer.configs.kotlin.v2019_2.*

object PullRequestAPIBuild : BuildType ({
    name = "Pull Request Build and Test"
    templates(_self.templates.PullRequestTemplate)
})
```

#### API Project

Of the parameters shown below, only `project.directory` and `vcs.checkout.rules`
will be familiar from the text above. The Octopus parameters are used in an
additional Octopus Deploy build configuration, which is not material to the
current demonstration.

```kotlin
package api

import jetbrains.buildServer.configs.kotlin.v2019_2.*

object APIProject : Project({
    id("Buzz_API")
    name = "API"
    description = "Buzz API"

    buildType(api.buildTypes.PullRequestAPIBuild)
    buildType(api.buildTypes.BranchAPIBuild)
    buildType(api.buildTypes.DeployAPIBuild)

    params{
        param("project.directory", "./EdFi.Buzz.Api");
        param("octopus.release.version","<placeholder value>")
        param("octopus.release.project", "Buzz API")
        param("octopus.project.id", "Projects-111")
        param("vcs.checkout.rules","""
            +:.teamcity => .teamcity
            +:%project.directory% => %project.directory%
        """.trimIndent())
    }
})
```

## Summary

TeamCity templates have been developed in Kotlin that greatly reduce code
duplication and ensure that certain important features are used by all
templates. Unfortunately they did not completely eliminate duplication. Through
use of class inheritance, merged-branch and pull request build configurations
are able to share common settings. However, parallel templates with some
duplication were still required.

In the future, perhaps I'll explore handling this through an alternative
approach using [feature
wrappers](https://blog.jetbrains.com/teamcity/2019/03/configuration-as-code-part-2-working-with-kotlin-scripts/)
instead of or in addition to templates. My initial impression of these wrapper
functions is that they obscure a build type's action: in the examples above, a
Template class reveals its base class, signaling immediately that there is more
to the Template. In the feature wrapper approach, one only finds the additional
functionality when reading the project file. It will be interesting one day to
see if the two approaches can be combined, moving the wrapper _inside_ the
template or base class, insead of being applied to it externally.

## License

All code samples above are Copyright &copy; 2020, Ed-Fi Alliance, LLC and
contributors. These samples are re-used under the terms of the [Apache License,
Version
2](https://github.com/Ed-Fi-Exchange-OSS/EdFi-Project-Buzz/blob/development/LICENSE).

## Previous Articles on TeamCity and Kotlin

* [Getting Started with Infrastructure as Code in TeamCity](https://tech.safnet.com/archive/2020/03/21/infrastructure-as-code-in-teamcity/)
* [Splitting TeamCity Kotlin Into Multiple Files](https://tech.safnet.com/archive/2020/03/22/splitting-teamcity-kotlin-into-multiple-files/)
