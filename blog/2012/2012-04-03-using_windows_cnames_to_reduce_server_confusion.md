---
layout: page
title: Using Windows CNAMEs to Reduce Server Confusion
date: '2012-04-03 19:20:19 -0500'
basename: using_windows_cnames_to_reduce_server_confusion
tags:
- tech
- Windows
excerpt_separator: <!-- truncate -->
---

A common challenge for development teams is remembering the names for all of the
different servers in an enterprise environment  when the server naming
convention is either not descriptive ("Deathstar", "Falcon", "XWing") or obscure
("abcDBS001", "abcDBS002", "abcWEB01"). The Star Wars names suffer from an
obvious problem of mapping description to purpose. Those obscure names are
commonly used to help distinguish between dozens to hundreds of different
servers in an enterprise. Arguably they are helpful to the infrastructure team
as they manage this motley collection. But for a developer, remembering if
"abcWEB01" is the test web server or prod can be challenging; even when
remembered, it would be simple enough to overlook or accidentally type
"abcWEB04".

<!-- truncate -->

A Windows Server can be configured with [a name
alias](https://learn.microsoft.com/en-us/previous-versions/windows/it-pro/windows-server-2003/cc776292(v=ws.10))
(CNAME) that preserves the naming convention used by infrastructure, but helps
the development team avoid confusion and accidents. Assuming that there is a
good separation between servers &mdash; say, development, test, and production
&mdash; and their purposes &mdash; say, web apps, services, reports, and
database &mdash; wouldn't it just be easier to refer to:

* devweb
* testweb
* prodweb
* devservices
* testsql
* _et cetera_

Of course, that scheme presumes that there is only one server in each category.
If there are multiple servers in order to fit different needs, then find a name
that explains that need: for example, `testexternalweb` and `testinernalweb`, for
DMZ and internal web servers. I can't begin to reckon the number of times such
an (aliased) naming convention would have helped avoid mistakes and improved
communication over the years.

Bonus: if `abcWEB01` needs to be retired and replaced by with `abcWeb10`, just
change the CNAME so that `prodweb` points to the new server. Application
configuration nightmare averted.
