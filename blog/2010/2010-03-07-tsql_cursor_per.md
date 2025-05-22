---
layout: page
title: T-SQL Cursor Performance Optimization
date: '2010-03-07 20:33:17 -0600'
basename: tsql_cursor_per
tags:
- tech
- database
- sql-server
excerpt_separator: <!--more-->
---

One should work hard to avoid Cursors in T-SQL &mdash; for instance, by using
recursive common table expressions &ndsh; but when you need to call a separate
stored procedure in a loop, you're stuck with them. I recently came across an
excellent guide to the subject, [Performance
Tuning SQL Server Cursors](http://www.sql-server-performance.com/tips/cursors_p1.aspx), which includes the following enlightening piece
of advice:

<!--more-->

> If you have no choice but to use a server-side cursor in your application, try
> to use a FORWARD-ONLY or FAST-FORWARD, READ-ONLY cursor. When working with
> unidirectional, read-only data, use the FAST_FORWARD option instead of the
> FORWARD_ONLY option, as it has some internal performance optimizations to
> speed performance. This type of cursor produces the least amount of overhead
> on SQL Server.
>
> If you are unable to use a fast-forward cursor, then try the following cursors
> in this order, until you find one that meets your needs. They are listed in
> the order of their performance characteristics, from fastest to slowest:
> dynamic, static, and keyset.

Every cursor I've ever written would have benefited from this.
