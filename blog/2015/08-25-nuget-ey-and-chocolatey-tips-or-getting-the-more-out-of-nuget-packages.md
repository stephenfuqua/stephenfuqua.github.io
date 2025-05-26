---
title: NuGet-ey and Chocolatey Tips, or, Getting More out of NuGet Packages
date: 2015-08-25
slug: nugety_chocolatey_tips
tags: [sdlc]
---

NuGet has been helping .NET developers maintain package dependencies for a number of years now, and any good dev should know the basic operations from within Visual Studio – how to add, update, and remove packages in a solution, using the [NuGet Gallery](https://www.nuget.org/packages). But to use only the NuGet Gallery is to know only half – or less – of the story. You might be missing out on&hellip;

* Testing out pre-release versions of your projects key dependencies.
* Reverting to older versions of libraries.
* Stand-alone tool installations using NuGet.
* Full-fledged Windows installations using Chocolatey.
* Placing your custom packages into private repositories.

Here are a few tips for moving toward mastery of this crucial part of the .NET development ecosystem.

<!-- truncate -->

## It's Just a Zip File

Like many of its older cousins in the world of package management, `.nupkg`, the file extension for NuGet packages, is just an alias for .zip. Change the filename from `abc.nupkg` to `abc.zip` and it will open beautifully from your favorite zip client. From time to time, it can be quite useful to open up a NuGet package and see what is inside.

Of course NuGet uses a particular file layout within the package, and you wouldn't want to create the `.nupkg` by hand. Instead, you describe the desired package with a `.nuspec` file (which you should keep in source control), and then use the `nuget pack` command to create your package (which you should _not_ keep in source control. Use an artifact repository instead).

Incidentally, you can also `nuget pack` your csproj file, but you have less control over the outcome this way.

## Read the Docs

As with most tools, you'll get more out of it if you start reading the [documentation](https://learn.microsoft.com/en-us/nuget/). I have particularly enjoyed the [command line reference](https://learn.microsoft.com/en-us/nuget/reference/nuget-exe-cli-reference) for working with `nuget.exe`. Note: this is basically, but not exactly, the same as the [Package Manager PowerShell Console](https://learn.microsoft.com/en-us/nuget/reference/powershell-reference). Use the former for automation, or manual execution of NuGet commands. Use the latter in Visual Studio for advanced functionality.

## Specifying the Version to Install

With both `nuget.exe` and the PowerShell console – but not in the Package  Manager gui – you can install older or pre-release versions of packages by providing the version number:

```powershell
Install-Package <SomePackageId> -version <number>
```

Or

```powershell
C:\YourProject> nuget.exe install <SomePackageId> -version <number>
```

There are two primary use cases for this:

1. Some teams publish pre-release versions of their packages. While you wouldn't typically want these in production, it can be useful to try out the pre-release in anticipation of up-coming enhancements or API changes.
1. I'm guessing that the majority of business .NET applications were written before NuGet came around. Many of those have dependencies on old packages, which were installed manually. A mad rush to replace manual references with NuGet packages might not be wise; you need to take time and evaluate the impact of each package. It can be useful to start by installing the same version as you already utilize, but from a NuGet package. Then, you can carefully work on upgrading to newer versions of the package in a deliberate test-driven manner.

## Software Installation

Most .NET devs probably don't realize that the `.nupkg` files can be used for much more than installing packages inside of .NET projects in Visual Studio and SharpDevelop. A basic `.nupkg` file differs from a self-installing `.exe` or an `.msi` file in that it is just a zip file, with no automation to the install. This can be useful for distributing static files, websites, and tools that don't need Windows registry settings, shortcuts, or global registration. Lets say that you pack up a website (.NET equivalent of a Java WAR file), and you want to install it in `c:\inetpub\wwwroot\MySite`. At the command prompt:

```powershell
C:\LocationOfNuPkg> nuget.exe install <YourPackageId> -Source %CD% -o c:\inetpub\wwwroot\MySite
```

If you are running IIS with the default configuration, then you've just installed your website from a `.nupkg` artifact. Because NuGet is retrieving the package from an artifact repository, you only need a tool to push this command to that server, and then the server will put the "current version" from the repository.

But you can also do more, and this is where [Chocolatey](https://chocolatey.org) comes in. Using the same `.nupkg` name, Chocolatey does for Windows what NuGet did for .NET applications: supports easy discovery, installation, and upgrade of -packages- _applications_. Once you have Chocolatey itself installed (follow directions on the home page), you install many common open source tools from the command line. For example, this article has neglected to mention that you need to download `nuget.exe` in order to run NuGet from the command line. For that, you can simply run:

```powershell
C:\>choco install nuget.commandline
```

This will install `nuget.exe` into `c:\ProgramData\Chocolatey\bin`, which automatically puts it into your command path. As with NuGet, versioning can be a huge benefit compared to distributing a zip or msi file.

The key difference between Chocolatey and NuGet is that the `choco` command runs a PowerShell install script inside the package. Basically anything you would have done in the past with an `msi`, perhaps built-up with a WiX `xml` file, you can do in a PowerShell script. Arguably, you have more control over your install, and it will be easier to support scripted installation processes. Again, the real power here is in automation. It won't give you a nice gui for walking your users through the install (although you could embed a call to an `msi` _inside_ your `.nupkg` file), but it does facilitate smoother rollout of applications to servers and multiple desktops.

## Private Repositories

Most companies are not going to be comfortable with the idea of their developers throwing the company's proprietary NuGet packages out on the Internet for the whole world to find. Instead, they'll want to install a piece of server software that acts as a local repository. [The Hosting Your Own NuGet Feed](https://learn.microsoft.com/en-us/nuget/hosting-packages/overview) lists the primary options available. So far, I've been relatively happy with NexusOSS, which also allows me to host Maven packages form my Java teammates, and npm packages for my Node.js team (as well as a few others).

As this article is already quite long, look for a future post with more information on using NexusOSS as a private repository for NuGet and Chocolatey packages.
