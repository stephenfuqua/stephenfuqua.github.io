---
layout: page
title: DbMail - A use for global temp tables in SQL
date: '2010-08-07 21:01:22 -0500'
basename: dbmail_a_use_fo
tags:
- tech
- database
- sql-server
excerpt_separator: <!-- truncate -->
---

"global temporary tables are visible to all sessions," says the [MSDN
documentation](http://msdn.microsoft.com/en-us/library/ms174979.aspx). I have occasionally wondered when this would be helpful. This
week I finally found a use, albeit limited: I want a quick-and-dirty process
that will e-mail a CSV file to me every day for a week. I wouldn't do this for a
full on production system (without dwelling on it, it just strikes me as too
error prone and inelegant), but for some testing I want to do over the course of
a week, it makes sense.

I run a query that populates a temp table, and I want to e-mail the contents of
the query using [sp_send_dbmail](http://msdn.microsoft.com/en-us/library/ms190307.aspx).
Again, the documentation tells something important: "Note that the query is
executed in a separate session, so local variables in the script calling
`sp_send_dbmail` are not available to the query." This applies not just to a
table variable, but also a local temp table (e.g. `#temp`). But a global temp
table (e.g. `##temp`) is a different story: works just fine. So there you go,
quick and dirty way to e-mail yourself some query results when you don't want to
just pass the raw query directly to the send command.
