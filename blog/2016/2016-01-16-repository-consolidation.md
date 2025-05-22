---
title: FlightNode Git Repository Consolidation
date: 2016-01-16
slug: flightnode_git_repository_consolidation
comments: true
tags:
- tech
- programming
- FlightNode
sharing: true
---

The .NET projects for FlightNode were created in several different Git repositories, thus giving us several small, well-contained, and re-usable projects. These small projects would be installed into the *Service* project as NuGet packages, which also makes for a faster compile in each discrete solution:

1. FlightNode.Common
1. FlightNode.DataCollection
1. FlightNode.Identity

But&hellip; this has approach has caused problems.

1. Each developer has to clone four different repositories.
1. Debugging a solution where core business logic is in a NuGet package is a huge pain.
1. We are having problems with NuGet package reference consistency (bad DLL paths)

After trying to solve the third problem several times, it is finally time to move on by fixing the problem.

![Repository consolidation](/images/scm_consolidation.png)

## Desired Structure

There are many ways to structure the combined files. In order to help preserve the possibility of re-splitting in the future, I will organize in this way:

* FlightNode.Api
  * Common
    * src
    * test
  * DataCollection
    * src
    * test
  * Identity
    * src
    * test
  * Service
    * src
    * test

## Re-organize FlightNode.Service

I will repurpose the existing FlightNode.Service repository as FlightNode.Api, and thus need to restructure it first. But before doing anything, I will create a branch in Git, making it simple to get back to the original code if I find I have a problem. From a Git-Bash prompt:

```bash
cd /c/Workspaces/FlightNode/FlightNode.Service
git checkout -b reorg
mkdir Service
git mv src Service
git mv FligthNode.Service.sln Service
git mv README.md Service
```

And I'm leaving the LICENSE file in place.  Let's go ahead and commit those changes locally, without pushing to the server:

```bash
git commit -m "Preparing for repository consolidation"
```

## Move Common

The simplest thing to do would be to cut and paste the files in Windows, from one directory to another. But, we would lose our Git history. So let's use Git to do this for us. Helpful article: [Moving Files from ON Git Repository to Another, Preserving History](http://gbayer.com/development/moving-files-from-one-git-repository-to-another-preserving-history/). In this case, I'm not interesting in keeping the original repository, so the commands can be a bit simpler than in that article.

The Common repository currently has two projects, and they are already separated into src and test folders. Staying in that repository, let's move the files into a Common folder and then commit the changes. The license file is identical to the one already in Service; therefore, we can ignore it. Best to delete it. I will stay in the develop branch here.

```bash
cd ../FlightNode.Common
mkdir Common
git mv README.md Common
git mv src Common
git mv test Common
git rm LICENSE
git commit -m "Preparing Common for repository consolidation"
```

Now it is time to pull this code into the Service repository:

```bash
cd ../FlightNode.Service
git remote add common ../FlightNode.Common
git pull common develop
```

Hey, there's a merge conflict. Didn't expect that: forgot about the hidden .gitignore file. Of course it is a rather easy merge to handle.

```bash
git mergetool
git commit -m "Merge Common into Service"
```

Result:

![Directories](/images/scm_dirs.png)

Oh, that solution file should have stayed in the root. I'll go ahead and rename it in anticipation of the repository rename.

```bash
git mv Service/FlightNode.Service.sln FlightNode.Api.sln
git commit -m "Rename solution file"
```

## History Preserved

```bash
git log
```

![Git log](/images/scm_log.png)

Recall that the middle commit, b9af26a, was in the FlightNode.Common repository, but now it is showing up in the FlightNode.Service repository - exactly as desired.

## DataCollection and Identity

Repeat the steps above. Not worth showing in detail.

## Fixing Up the Solution

Open the renamed FlightNode.Api.sln file in VS2015. The solution already had references to all of the existing projects, since I hadn't yet turned them into distinct NuGet packages. These references are now broken and must be fixed manually. Simplest thing to do: remove and re-add them, keeping the helpful breakdown into solution folders.

## Dependency Problems

Of course all of those red lines indicate build errors, all of which are dependency problems. Since NuGet packages have been very problematic, I'm going to do radical surgery:

* Delete the existing Packages directory
* Edit each project file, changing the DLL references to a Package directory at c:\workspaces\FlightNode.Service
* Reload the projects and re-bind them to each other, as necessary.
* Restore NuGet packages
* Build

Initially the packages restored into c:\workspaces\FlightNode\Packages, which is not what I wanted - Packages should have been placed under FlightNode.Service. To remedy that, I'll add a nuget.config at the root of the Service folder.

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <config>
    <add key="repositoryPath" value=".\Packages" />
  </config>
</configuration>
```

## Final Test

As a final test to make sure all the dependencies are wired up correctly, I'll remove the Packages directory again, and move the FlightNode.Service folder (temporarily) to a path outside of Workspaces.

Build success!

## Cleanup

In FlightNode.Service, I need to remove the no-longer-necessary remotes

```bash
git remote remove common
git remote remove data
git remote remove identity
```

Of course I need to commit my final dependency modifications and a few new files

```bash
git add readme.md
git add nuget.config
git commit -am "Fixing dependencies after repository consolidation"
```

Finally, time for GitHub.

```bash
git push origin reorg
```

Over in GitHub…

1. Rename existing FlightNode.Service repository to FlightNode.Api.
1. Pull changes from my fork into the master FlightNode/FlightNode.Api repository.
1. Delete the extraneous repositories… eventually. Leave them for now, "just in case."

Done.
