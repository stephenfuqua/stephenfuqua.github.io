---
title: "NuGet Packaging, Part Two: Dependency Publishing"
date: 2015-09-04
slug: nugety_chocolatey_tips_part_2
tags: [sdlc]
---

Recently I was talking with a friend and extolling the virtues of using NuGet packaging for application and web site deployments - and I nearly forgot the core advantage: dependency management. It is all fine and well to have a fancy zip file, relabeled as .nupkg. You get the benefit of version control on the package itself, and you get the nuget.exe or choco.exe installer (or coming soon, OneGet).

But the most important piece is this: you don't have to bundle your dependencies with your installer package. You just need to "wire" them up properly in the .nuspec specification file, and make them available. Now, let's talk about managing those packages.

<div class="text--center">
![diagram](/img/packaging.png)<!-- {: .img-fluid .border .rounded } -->
</div>

## Teasing Apart the Dependencies

Let's paint the scene: you have an ASP.NET web application. It depends on a handful of open source libraries available through the NuGet Gallery, and on some pre-NuGet libraries. You store those DLLs in a folder under source control. It also depends on in-house class libraries. Some of these are under active development and are part of the Visual Studio solution file, and some are older and rarely change.

In traditional installations, you would bundle all of these libraries along with the ASP.NET code in one "giant" zip or msi file. Disk space is cheap, but if you want anything like continuous delivery, then you are going to be creating this giant file quite frequently. Maybe multiple times per day. Properly packaged dependencies can significantly reduce the amount of disk space, and the the file transfer times, for your deployments.

In the most extreme situation, you would bundle separate NuGet packages for: ASP.NET web application; each in-house library; each pre-NuGet library; and no action required for the NuGet Gallery-hosted packages. Now, you only update the relevant packages when their source code changes. And you only distribute the updated packages.

On the other hand, that is a lot of packages to manage. And pulling the active-development libraries out of the solution can be quite the pain when it comes to debugging. Thus it might be worthwhile to group things together. Consider leaving the active libraries connected to the web site solution. Pull the basically static custom libraries into separate NuGet packages - probably one per library or per coherent grouping. And do the same for the third party pre-NuGet packages. Publish these packages out to an in-house repository server.

## Artifact Repository

[NexusOSS](http://books.sonatype.com/nexus-book/reference/running.html) is a good multi-purpose repository server, which out-of-the-box supports NuGet, Maven (for Java), Gems (for Ruby), NPM (for Node.js), and Sites (any kind of web site or general application). In my experience it is easy to configure on either Windows or Linux. There are other options available - including cloud hosting, if you prefer not to manage your own server (e.g. [MyGet](https://www.myget.org/)).

Within each of these systems, you create a Repository - a collection of packages. The list of available packages is a Feed. Whether self-hosted or provisioned by a SaaS provider, if we're talking about internal application support, you'll want to secure the Feed. Unless your system is self-hosted behind a strong firewall, be sure to access it over a secure transport (SSL) with proper usernames and passwords, and disable anonymous access.

Each user will need to provide username and password in Visual Studio - every single time they try to access the feed (maybe that's changed in Visual Studio 2015; I haven't had a chance to check yet).

But you can avoid this at the command line, through nuget.exe's `sources` command:

```powershell
PS> nuget.exe sources `
    -Name <Your NuGet Repo> `
    -source <URL to your NuGet feed> `
    -user <username> `
    -pass <password>
```

## Publishing

For publish/deploy operations, your repository might use a different address. For example, NexusOSS provides different feeds for publishing and consuming. Therefore those developers who have publishing permissions would want to setup both feeds, e.g.

```powershell
PS> nuget.exe sources add `
    -Name "Your Nexus Deploy Feed" `
    -source https://server.example.com/nexus/service/local/nuget/your-feed-id/ `
    -user username `
    -pass somethingcomplex

PS> nuget.exe sources add `
    -Name "Your Nexus Consume Feed" `
    -source https://server.example.com/nexus/service/local/nuget/your-feed-id/ `
    -user username `
    -pass somethingcomplex
```

Now that the feeds are setup, and you've determined how you'll want to group your libraries into separate packages, you need to create .NuSpec files to define those packages. Best to [read the documentation](https://docs.nuget.org/create/creating-and-publishing-a-package) on this (which also demonstrates the `nuget pack` command for creating the package itself).

Publishing the package(s) you just created requires an API key, whether or not you have username/password security turned on. You should cache that key:

```powershell
PS> nuget.exe setapikey <YourAPIKey> `
    -source https://server.example.com/nexus/service/local/nuget/your-repository-id/
```

Finally, the payoff:

```powershell
PS> nuget.exe push <YourPackage>.nupkg `
    -source https://server.example.com/nexus/service/local/nuget/your-repository-id/ `
    -NonInteractive
```

When automating this, you need to manually issue the `sources add` and `setapikey` commands _as the user running your automation_, on every automation server. The `pack` and `push` commands, on the other hand, will be part of your automation. For example, if using a Git workflow, you might package and push pre-release packages whenever code is pushed/merged into a `develop` branch, and likewise with release packages based on a `master` branch.

One last tip. Some artifact repositories, including NexusOSS, can act as proxies for the open repositories on the Internet. When you configure and use a proxy, it will cache the libraries that you frequently use. And, you can disable the public feed on your workstations - thus preventing accidental pushes out to the public feed:

```powershell
PS> nuget source remove -Name https://www.nuget.org/api/v2/
```
