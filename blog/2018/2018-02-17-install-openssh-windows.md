---
title: Installing OpenSSH in Windows
date: 2018-02-17
comments: true
tags: [devops, Windows]
sharing: true
---

One of my very first technical blog posts was about running OpenSSH on Windows
[no longer available] - written over 14 years ago. Recently I was playing around
with Microsoft's [port of OpenSSH](https://github.com/PowerShell/Win32-OpenSSH),
which has officially achieved version [v1.0.0.0 beta
status](https://github.com/PowerShell/Win32-OpenSSH/releases/tag/v1.0.0.0).
[Installation](https://github.com/PowerShell/Win32-OpenSSH/wiki/Install-Win32-OpenSSH)
was pretty easy, but I ran into a little problem: [needing to set "user" group
permissions](https://github.com/PowerShell/Win32-OpenSSH/issues/1035). This
little gist has my final script. For reasons of my own I didn't feel like
running the chocolatey install, so I don't know if it has this permission
problem.

<script src="https://gist.github.com/stephenfuqua/46332c46741d94dc216e1332b437012c.js"></script>
