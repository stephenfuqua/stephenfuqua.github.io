---
layout: page
title: 'Diagnosing Production Problems: Zeroth Law'
date: '2010-08-14 10:26:07 -0500'
basename: diagnosing_prod_1
tags:
- tech
- sdlc
- programming
excerpt_separator: <!-- truncate -->
---

Stephen's first law of diagnosing problems in production should have been: make
sure you actually know the scope of the problem. We have a process that checks
for duplicates in an inbound file. Records marked as duplicates are not moved
into production. A refinement of the process was installed this week. All the
sudden, e-mails showed that thousands of records were being marked as
duplicates. I came over to help investigate, and found people looking at code,
trying to figure out what was going on, because they knew without doubt that
these records were not in fact duplicates.

But we needed to step back and ask what is the scope of the problem? We looked
at the e-mail with the duplicates, picked a name or two from the list, and
looked in the original input files and confirmed that they were not in the
files. So how/why were they reported? But then let's set that aside, and ask:
did all of today's records make it into production? If yes, then we have a
problem but not a crisis. The answer was yes: we could see a 1-1 match between
inbound file and outbound production data. Therefore, we have a minor reporting
problem, but the core of the system was working just fine. Panic averted.

So what was the cause? A staging table that had not been truncated after a
previous file was processed. All those records were being reported as
duplicates.
