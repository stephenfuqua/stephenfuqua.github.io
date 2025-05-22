---
layout: page
title: Fork Problem with Cygwin
date: '2003-12-18 04:34:56 -0600'
basename: fork_problem_with_cy
tags: [tech, Windows]
excerpt_separator: <!-- truncate -->
---

I've been enjoying the use of [OpenSSH in Windows](http://sshwindows.sourceforge.net/) lately but ran
into a small problem today: "fork: Permission denied".

<!-- truncate -->

OpenSSH runs in Windows via a port using [Cygwin](http://www.cygwin.com/) ("_a Linux-like environment for
Windows_").  It has full SSH capabilities, including key management and server
operation (yes, that means you can SSH into your Windows box!). Today I tried to
load the `ssh-agent` at the command line (`cmd.exe`) and got an obnoxious
response: `fork: permission denied`.

I found the [following answer](https://web.archive.org/web/20051222052009/http://developer.akopia.com/archive/interchange-users/2000/msg06675.html),
which isn't cygwin or Windows specific (though the low limit might be):

> Fork wont run if you run out of processes per that user.

I was running Outlook, Dreamweaver MX, Photoshop 3 (yes, v3!), and SETI@Home as
well as the command line. I didn't need Photoshop at the moment, so I decided to
close it and see what happens. Sure enough, the forking problem went away.

Now surely there is some way to avoid this problem in the future? There must be
some means of increasing the number of processes available? I've certainly run
Cygwin commands with more applications open in Windows before. Let me know if
you have a solution; I'll update the post if I find anything.
