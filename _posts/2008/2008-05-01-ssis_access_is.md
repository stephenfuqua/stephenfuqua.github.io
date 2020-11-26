---
layout: post
title: 'SSIS: Access Is Denied from SQL Agent'
date: '2008-05-01 15:57:30 -0500'
basename: ssis_access_is
tags:
- tech
- database
- sql-server
- ssis
---

**Problem:** I have an SSIS package, `MyPackage`, stored on `MyServer` in the
Package Store. I create an Agent to run the package, running under a SQL account
hooked up to a proper proxy and credentials for Windows authentication. Works in
development, doesn't work in production: the agent gets the error `Connect to
SSIS Service on machine "MyServer" failed: Access is denied`.

<!--more-->

**Solution:** Clearly there is something different between the two servers, and
it is probably an important difference. Kirk Haselden has <a href=
"http://www.sqljunkies.com/WebLog/knight_reign/archive/2006/01/05/17769.aspx"> a
few comments</a> about this issue. They're instructive, but didn't solve my
problem. I granted my proxy account full access to MsDtsServer, but still I get
the denial.

A <a href="http://blogs.digineer.com/blogs/jasons/">smart guy</a> once pointed
out that the `dtexec` command line program shows more information about errors
than the agent does, so in the Agent properties &rarr; my job &rarr; edit &rarr;
Command Line tab, I copied the command line options. Then I opened up a command
prompt and ran `dtexec`:

```none
dtexec /DTS "MyPackage" /SERVER MyServer /CONFIGFILE "c:\SSIS\ConfigFiles\baseline.dtsConfig" /MAXCONCURRENT " -1 " /CHECKPOINTING OFF /REPORTING E
```

And it worked.

Clearly there is still some problem with remote connections. The agent sees the
proper server name seems to try a remote connection instead of a local one
&mdash; even though the SQL Server instance with the agent is the same one
driving Integration Services.

Back in the `Job Step Properties`, I edited the command line manually and
changed `MyServer` to `localhost`, tried the agent again, and finally found
success.
