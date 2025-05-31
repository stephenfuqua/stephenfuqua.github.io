---
title: Warning About User Defined Functions in SQL Queries
date: '2008-02-06 10:57:09 -0600'
slug: warning_about_u
tags:
- tech
- database
- sql-server

---

I was looking at a query today that has an inline expression in it, something similar to

```sql
CASE WHEN myTable.myColumn < 5 THEN NULL ELSE myTable.myColumn END
```

This particular piece of business logic is used in many different places (well,
not literally, since I made up a fake example), so I created a UDF to simplify
the queries that use this statement. Suppose that UDF is called
`dbo.fnNulifyMyColumn`.

<!-- truncate -->

Now let's suppose I originally had the following query:

```sql
SELECT CASE WHEN myTable.myColumn < 5 THEN NULL ELSE myTable.myColumn END FROM myTable
```

And replaced it with:

```sql
SELECT dbo.fnNullifyMyColumn(myTable.myColumn) FROM myTable
```

The logic works perfectly. But I noticed that, in my real world scenario, the
performance went down substantially. In fact, my query went from requiring 9
seconds to execute up to 27 seconds!

Turns out that there is a lot of overhead in using a function. I decided to see
if Itzik Ben-Gan has anything to say about this in his book [Inside Microsoft
SQL Server 2005: T-SQL
Programming](https://archive.org/details/insidemicrosofts2005beng). He does:
"There are many benefits to using UDFs in terms of code simplicity and
maintenance; though in terms of performance, typically you'll be better off if
you manage to express your calculations as inline expressions in the query and
avoid using UDFs."
