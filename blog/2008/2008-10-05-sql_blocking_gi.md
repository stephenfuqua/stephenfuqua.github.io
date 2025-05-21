---
layout: page
title: "(SQL) Blocking Giving You the Blues?"
date: '2008-10-05 22:02:03 -0500'
basename: sql_blocking_gi
tags:
- tech
- database
- sql-server
excerpt_separator: <!--more-->
---

**Problem:** You have a long-running query in SQL Server that is causing failures
all over the place. Activity Monitor shows you the cause is blocking.

**Causes:** Blocking essentially means "you've locked a table, and now someone
else is stuck waiting for you to unlock it." We all know (or should know) that
transactions cause table locks, and thus blocking. That's one reason that
transactions need to be short and sweet. But there is another source of
blocking, one that can be a bit more subtle: long-running queries that are
trying to read committed data only.

<!--more-->

READ COMMITTED is the default isolation level for SQL Server 2005 (and most
other versions, I presume). Ben Gan describes: "In this isolation level,
processes request a shared lock to read data and release it as soon as the data
has been read &mdash; not when the transaction terminates." Thus if you have a
poorly-performing SELECT query, it might take a while before the shared lock is
released. In the meantime, everyone else is blocked.

**Solutions:** If transaction management is your problem, then you need to
re-evaluate the strategy. Small transactions are needed. You might even need to
fake a transaction. Real SQL gurus might have a better strategy, but one that I
have used is to mark a record with an error code of "TR" for transaction. For
instance, I have two tables, one that somewhat summarizes the second. I insert
into the first, and then insert thousands of records into the second one.

Originally I thought to rollback the whole transaction if any of the thousands
of inserts failed. But I realized that would be impractical. So instead I marked
the parent record with "TR", and when done with the thousands I update that
record to remove the TR. At any time I can see that this particular record is
not yet finished, or I can create a custom rollback strategy that just deletes
the record.

If a long-running query is the problem, then you might consider turning off
locking by setting the isolation level to READ UNCOMMITTED. But don't do this
blindly &mdash; you'll want to carefully evaluate the tables you are querying.
What is the likelihood that some of your data will change during the lifetime of
the query? If there is any meaningful chance of change, then you'll also have a
meaningful chance of reading "dirty data." But, if your tables are rarely
updated, or you are querying only "old" data that won't be touched, perhaps this
is a safe maneuver. Worth a try anyway.

Finally, you really ought to look at the root cause &mdash; why is the query
taking so long? Do some performance tuning: create new indexes that eliminate
table scans, key lookups, and hash matches, for instance.

PS. my suggestion may be a <a
href="http://sqlblogcasts.com/blogs/tonyrogerson/archive/2006/11/16/1345.aspx">ticking
timebomb</a>; also consider SNAPSHOT isolation level.
