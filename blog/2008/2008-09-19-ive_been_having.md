---
layout: page
title: SSIS - 32 Bit ForEach File Enumerator Was Not Registered
date: '2008-09-19 21:57:08 -0500'
basename: ive_been_having
tags:
- tech
- database
- sql-server
- ssis
excerpt_separator: <!--more-->
---

I've been having problems migrating some SSIS packages from localhost (32bit) to
the server (Windows Server 2003 64bit, SQL Server 2005 Enterprise SP2). These
packages have Excel data connectors, and hence must be run in 32 bit mode. When
I try to run them with the 32bit `dtexe`c, I get the "generic" error "the package
failed to load" (`0xC0010014`). I stripped down the package until I found the
source of the error: a ForEach container, using the File Enumerator with the
directory set to a variable. When I remove the variable setting it works, when I
add the variable expression it fails. Note: this does not fail in the 64bit
`dtexec`.

<!--more-->

I read <a
href="http://support.microsoft.com/default.aspx?scid=kb;en-us;913817">KB
913817</a> and determined that this was not causing my problem. When I open the
package in Business Intelligence Studio on the server itself, I get an error
when I try to edit the expressions on the ForEach loop (but only when the
Enumerator is set to File).Poking around the SSIS DLLs, I found `c:\program files
(x86)\microsoft sql server\90\dts\foreachenumerators\ForEachFileEnumerator.dll`.
Re-registered it with `regsvr32`. Voila, problem solved.
