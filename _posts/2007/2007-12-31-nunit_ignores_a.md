---
layout: post
title: NUnit Ignores App.Config
date: '2007-12-31 12:00:41 -0600'
basename: nunit_ignores_a
tags: [tech, dotnet, unit-test]
excerpt_separator: <!--more-->
---

**Problem:** You want to run NUnit tests in a class library (dll). These test
rely on an application configuration file (app.config) for some settings, i.e.
custom appSettings or database connection strings. The code compiles and runs
fine by itself, but your unit tests always fail. Attaching the Visual Studio
debugger to NUnit and stepping through the code, you see that the config seems
to be ignored.

<!--more-->

**Solution:** This is a perfectly reasonable thing to do, and it works fine.
That is, it works if your "project" in NUnit consists of the assembly, not the
Visual Studio Project. If you setup the NUnit project by clicking on `Project >
Add VS Project`, then for some reason the configuration file will be ignored.
If, however, you simply drag your assembly file into NUnit, then it should work
as expected.

## Comments

_imported from old Movable Type blog_

> author: Asif\
> date: '2009-02-26 04:14:50 -0600'
>
> Better explanation::http://david.givoni.com/blog/?p=4
