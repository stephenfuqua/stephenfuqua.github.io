---
layout: post
title: Running Both .Net 1.1 and 2.0 in Windows 2003 Server 64 Bit Edition
date: '2007-06-21 19:59:42 -0500'
basename: running_both_ne
categories:
- tech
- dotnet
excerpt_separator: <!--more-->
---

**Problem:** Microsoft .Net Framework 1.1 and .Net Framework 2.0 don't play well
together (as ASP.Net apps) on Windows 2003 Server 64 Bit Edition.

**Solution:** either upgrade any ASP.Net 1.1 to 2.0 or switch to 32 bit
compatibility mode. Of course switching to 32 bit mode will cause you to lose
out on some performance benefits, but maybe you're okay with that (unless you're
running under a very high load). Two easy steps:

<!--more-->

<ol>
<li>Per <a href="http://support.microsoft.com/kb/894435">http://support.microsoft.com/kb/894435</a>, set IIS to 32 bit compability mode, and re-installed (with `aspnet_regiis.exe`) both versions in all sites.
</li>
<li>Once this is done you can't get the ASP.Net tab back in IIS properties. To manually install the proper ASP.Net version in a particular app (i.e. /MyApp): in cmd line, under appropriate version in `c:\windows\Microsoft.Net\Framework\{version}`, type `aspnet_regiis.exe -sn W3SVC/1/Root/MyApp`.</li>
</ol>

Hat tip to <a href="http://www.egilh.com/blog/archive/2005/03/17/602.aspx">Egil
Hogholt</a> for the `aspnet_regiis **-sn**` suggestion.
