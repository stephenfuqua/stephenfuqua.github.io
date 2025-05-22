---
layout: page
title: SSIS Deployment Headache
date: '2012-03-18 14:42:04 -0500'
basename: ssis_deployment_headache
tags:
- tech
- database
- sql-server
- ssis
excerpt_separator: <!-- truncate -->
---

For years I've had problems with SSIS deployments to production. In fact, I
completely abandoned SSIS packages because it was so difficult to deploy to
production (in SQL Server 2005): I always ended up with errors that would
require me to hand-edit the file and hard-code paths. That, despite the fact
that my config files have the database connection strings and file paths in
them. And despite the fact that my packages usually work fine on the test server
but fail in production. After years of this problem, it suddenly occurred to me
that one piece in particular is probably at fault. But given that I do not have
access to production such that I can investigate, it will always be a
hypothesis: using a template that sets various properties with the help of
_variable expressions_.

<!-- truncate -->

The SSIS Junkie blog has a great series of posts about SSIS standards and
building templates, including [SSIS:
Package Template](http://consultingblogs.emc.com/jamiethomson/archive/2007/03/11/SSIS_3A00_-Package-Template.aspx). I used this as a model for building my SSIS templates.
While the advice is sound, and makes development of new packages very easy, I
believe that part of that advice is causing the problems. You see, many
different file paths are _[set
with expressions](http://consultingblogs.emc.com/jamiethomson/archive/2006/10/05/SSIS-Nugget_3A00_-Dynamically-set-a-logfile-name.aspx)_. In particular, the checkpoint file and log file paths are
set with expressions that build the path from a config file variable. What seems
to happen is that SSIS attempts to access the path with the settings in the
package &mdash; before reading the config file. Thus if the path does not exist
in production, there will be an error. Even though you expect the config file to
redirect to the correct path.

The most annoying error is related to checkpoint files, which I've always
disabled. But SSIS still tries to determine where it _would_ put the checkpoint
file, if it were to create one. And that generates a failure. But to blame it on
the template and variable expression approach might be going too far. After all,
how else could we get dynamically generated log file names? I'm sure there are
better approaches (perhaps using a Script component?), but as I am out of the
"SQL Architecture" role at this point, I'll leave that to others to solve. Just
be warned: setting dynamic file paths with expression variables could cause
deployment -headaches- nightmares.
