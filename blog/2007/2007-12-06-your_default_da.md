---
title: Your Default Database Is Offline - How Do You Login?
date: '2007-12-06 10:22:27 -0600'
slug: your_default_da
tags: [tech, database, sql-server]
excerpt_separator: <!-- truncate -->
---

**Problem:** without thinking about the ramifications, you've taken your default
database in SQL Server offline. When you try to login through SQL Server
Management Studio (or Query Analyzer) you get an error message because the app
couldn't switch to the default database. Obviously, one feels pretty dumb after
doing this. Thankfully it happened to me in development, not production!

**Solution:** It turns out the solution is just as easy as the mistake: when you
log in, click the options button and choose a different database. More detail at
[public
class:ben harrell](http://benharrell.wordpress.com/2007/01/15/cannot-open-user-default-database-login-failed-login-failed-for-user-username-microsoft-sql-server-error-4064/).
