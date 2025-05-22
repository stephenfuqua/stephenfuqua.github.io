---
title: Starting Out with Service Broker
date: '2008-11-16 20:35:05 -0600'
slug: starting_out_wi
tags:
- tech
- database
- sql-server
---

**Problem:** you have an application that needs to trigger some process via SQL
Server but don't want your main process hung up waiting. So you decide to setup
Service Broker in order to make an asynchronous call, with the receiving service
doing your work for you. You've read all about it, and tried it out after hours,
but it didn't work. What gives?

<!-- truncate -->

**Solution:** obviously, this situation occurred with your humble blogger. I had
a few different things going on, but once it was solved, how sweet it was.

First thing is, what's happening? Anything? I couldn't see any sign that
anything was occurring. The SQLTeam blog [
pointed out ](http://www.sqlteam.com/article/how-to-troubleshoot-service-broker-problems)that there are a number of events that can be monitored in the
SQL Profiler. Thanks to the Profiler, I could see this error: `Could not obtain
information about Windows NT group/user...`. Working from home, and
apparently it was trying to validate me, even though I've never had any other
problems with the database. Found an MSDN [
forum posting ](http://forums.microsoft.com/MSDN/ShowPost.aspx?PostID=542041&amp;SiteID=1)that helped me solve this by resetting the owner account to sa
instead of me.

Getting closer now. Services are firing, but nothing is happening. I created the
service with Activation ON, but the stored procedure tied to the service queue
just isn't being called. Maybe I missed something. Look to the [documentation](http://msdn.microsoft.com/en-us/library/ms189529.aspx),
and there it is: the examples I had read somehow failed to mention how to turn
the service itself on (though they did include this important activation on
bit). `ALTER QUEUE dbo.MyQueue WITH STATUS = ON;`, and try again. That does it.
Service now working.
