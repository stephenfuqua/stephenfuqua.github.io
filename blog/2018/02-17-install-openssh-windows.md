---
title: Installing OpenSSH in Windows
date: 2018-02-17
tags: [devops, Windows]
---


One of my very first technical blog posts was about running [OpenSSH on
Windows](../2003/12-18-fork_problem_wi.md) - written over 14 years ago. Recently
I was playing around with Microsoft's [port of
OpenSSH](https://github.com/PowerShell/Win32-OpenSSH), which has officially
achieved version [v1.0.0.0 beta
status](https://github.com/PowerShell/Win32-OpenSSH/releases/tag/v1.0.0.0).
[Installation](https://github.com/PowerShell/Win32-OpenSSH/wiki/Install-Win32-OpenSSH)
was pretty easy, but I ran into a little problem: [needing to set "user" group
permissions](https://github.com/PowerShell/Win32-OpenSSH/issues/1035). This
little gist has my final script. For reasons of my own I didn't feel like
running the chocolatey install, so I don't know if it has this permission
problem.

<!-- truncate -->

```powershell
$toolsDir = "c:\tools"
$sshZip = "$toolsDir\OpenSSH-Win64.zip"
$sshDir = "$toolsDir\OpenSSH-Win64"
$install = "$sshDir\install-sshd.ps1"

# Download OpenSSH
$url = "https://github.com/PowerShell/Win32-OpenSSH/releases/download/v1.0.0.0/OpenSSH-Win64.zip"
Invoke-WebRequest -Uri $url -OutFile $sshZip

# Unzip the OpenSSH archive
Expand-Archive -LiteralPath $sshZip -DestinationPath $toolsDir

# Install SSH
Invoke-Expression $install

# Absolutely necessary: the users group must have appropriate permissions on the OpenSSH folder
$acl = Get-Acl $sshDir
$ar = New-Object System.Security.AccessControl.FileSystemAccessRule(".\users","ReadAndExecute,Synchronize", "ContainerInherit,ObjectInherit", "None", "Allow")
$acl.SetAccessRule($ar)
Set-Acl $sshDir $acl

# Open firewall and set service startup policy
New-NetFirewallRule -Name sshd -DisplayName 'OpenSSH Server (sshd)' -Enabled True -Direction Inbound -Protocol TCP -Action Allow -LocalPort 22
Set-Service sshd -StartupType Automatic
```
