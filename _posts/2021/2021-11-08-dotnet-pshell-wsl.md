---
layout: page
title: Preparing for PowerShell Core and .NET Development on Ubuntu on Windows
date: 2021-11-08
comments: true
tags:
  - devops
  - tech
  - programming
  - linux
  - windows
sharing: true
---

**Goal**: setup PowerShell Core and .NET for development in Ubuntu running in
Windows subsystem for Linux (WSL). And a few other tools.

**Motivation**: porting PowerShell scripts for .NET development on Linux, thus
enabling more programmers to develop on [a certain
codebase](https://github.com/Ed-Fi-Alliance-OSS) and enabling use of Linux-based
containers for continuous integration and testing.

<!-- more -->

## 1. Install Ubuntu and PowerShell (Core) 7

Read [Install PowerShell 7 On WSL and
Ubuntu](https://www.saggiehaim.net/install-powershell-7-on-wsl-and-ubuntu/),
which nicely covers not only PowerShell but WSL as well. Be sure to download the
`powershell-?.?.?-linux-x64.tar.gz` file for a typical Windows machine.

TIP: the author shows use of a pre-release over version 7. Head over to the
[GitHub repo's release page](https://github.com/PowerShell/PowerShell/releases/)
to find the latest relevant release.

If you want to verify the SHA256 hash after download, then run the following in
your Bash prompt:

```bash
openssl sha256 <file>
```

## 2. Install .NET

First, make sure you know which Ubuntu distribution version you have with this
command:

```bash
lsb_release -a
```

Now read [Install the .NET SDK or the .NET Runtime on
Ubuntu](https://docs.microsoft.com/en-us/dotnet/core/install/linux-ubuntu). Make
sure you follow both sets of instructions for your version: the instruction that
has you download a `.deb` file, and the instructions for installing the SDK.

The examples in this article show installation of .NET Framework `6.0`. You  can
easily change the commands to `5.0` or `3.1` as needed.

## 3. Git

See [Get started using Git on Windows Subsystem for
Linux](https://docs.microsoft.com/en-us/windows/wsl/tutorials/wsl-git)

## 4. Bonus: Install Custom Certificate

Most users will not have this situation... needing to install a custom
certificate in WSL, e.g. for a corporate network.

Assuming you have the certificate file, you'll need to know which _kind_ of file
you have. Not sure? See [What are the differences between .pem, .cer and
.der?](https://stackoverflow.com/questions/22743415/what-are-the-differences-between-pem-cer-and-der/22743616)

Now install it, with help from [How do I install a root
certificate?](https://askubuntu.com/questions/73287/how-do-i-install-a-root-certificate).

## 5. Try It Out

I have previously cloned [Ed-Fi
AdminApp](https://www.github.com/Ed-Fi-Alliance-OSS/AdminApp) into
`c:\source\edfi\AdminApp` on my machine. Instead of re-cloning it into the Linux
filesystem, I'll use the Windows version (caution: you could run into line feed
problems this way; I have my Windows installation permanently set to Linux-style
`LF` line feeds).

```bash
cd /mnt/c/source/edi/AdminApp
git fetch origin
git checkout origin/main
pwsh ./build.ps1
```

And... the build failed, but that is hardly surprising, given that no work has
been done to support Linux in this particular build script. Tools are in place
to start get this fixed up.

![Screenshot of terminal window](https://blog.safnet.com/images/pshell-dotnet-wsl-adminapp.jpg){: .img-fluid }
