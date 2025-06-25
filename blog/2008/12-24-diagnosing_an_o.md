---
title: Diagnosing an Obnoxious Reporting Timeout Problem
date: '2008-12-24 22:10:58 -0600'
tags:
- tech
- dotnet
- sql-server
- performance

---

We had a horribly pernicious timeout problem recently. It was occurring in a
.Net 2.0 application written to retrieve  reports from SQL Server 2005 Reporting
Services via its web services interface. The query behind the report was a bit
large, but typically would run under 30 seconds. We had judged that new indexes
were out of the question because of their impact on the already slow program
that loads the key data. All of the sudden, we started getting continuous
timeouts. After a couple of days, the underlying query was up to 15 minutes
execution time!

In the end multiple interacting problems had to be solved in order to get the
reports running properly. For the past few weeks they've been running without a
hitch.

<!-- truncate -->

## Lesson 1: Optimization Plan Over-Dependence

Query execution plan shows you where the work is occurring for a particular
optimized plan. But, there may be something that is causing the SQL engine to
optimize incorrectly &mdash; that something may not stand out as a problem in
the execution plan, but removing it could make a significant difference. When
you have a nasty query, taking far longer than you reasonably expect, and your
optimization strategies have failed you, then try removing bits of the query to
see what happens. The SQL Engine may suddenly be able to run a more optimum
execution plan. Of course you'll have to look to an alternative way of getting
the information you excluded from your query.

This was a complex query, as I said, that used a CTE and a temporary table.
Re-arranging one part had the unexpected effect of bringing the query time, when
executed by hand, down to just a few seconds. But the next night, the report
timed out again.

## Lesson 2: Web Service Timeout

I suddenly remembered that the difficult query is in reporting services, rather
than in the application. So why was the application throwing a timeout message
anyway? The problem lay with Reporting Services, due to [dynamic
compilation](https://msdn.microsoft.com/en-us/library/ms366723.aspx). I'll let Microsoft describe dynamic compilation of ASP.Net
websites (and web services), which includes Reporting Services:

> By default, ASP.NET Web pages and code files are compiled dynamically when
> users first request a resource, such as an ASP.NET page (.aspx file), from a
> Web site. After pages and code files have been compiled the first time, the
> compiled resources are cached, so that subsequent requests to the same page
> are extremely efficient.
> ...
> ASP.NET dynamic compilation enables you to modify your source code without
> having to explicitly compile your code before deploying your Web application.
> If you modify a source file, ASP.NET automatically recompiles the file and
> updates all linked resources.

I have not been able to find the threshold, but I recall that IIS eventually
abandons the compiled files when they have not been accessed for some period of
time. Let's call that period X minutes. Here's what happens:

1. User A is the first person on the website. User A must wait some short period of time (depends on the complexity of the site) while IIS recompiles.
1. User B comes in to the site less than X minutes after A left it. User B has no wait time, as the site is compiled.
1. User C comes in to the site more than X minutes after B left it. User C has the same wait time as User A.

The application was running in the evening, when few people are in the office
using the Reporting Services. It was effectively User A, having to wait.
Unfortunately that "short period of time" was longer than the default web
service timeout, 100 seconds. On Tuesday and Wednesday I restarted the scheduled
job that runs the app, which came in like User B &mdash; the first failed
attempt did successfully compile the site, therefore the second attempt had no
problem.

To solve this, I doubled the web service timeout in report application. Problem
finally solved.

## Comments

Imported from old Movable Type blog:

> author: Mike Fiedler \
> date: '2009-02-10 18:36:56 -0600'
>
> Hi there.
>
> I seem to be having the same issue as you have detailed in "Lesson 2" - the
> 100 second timeout issue - you mention that raising a timeout threshold
> resolved the issue? I can't seem to figure out where to modify that.
