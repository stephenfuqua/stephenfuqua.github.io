---
title: Granting Execute Permission to All Stored Procedures
date: '2007-06-22 22:39:17 -0500'
tags: [tech, database, sql-server]

---

## Problem

You've transferred or run a bunch of stored procedure scripts, but
you can't execute them. Reason - execute permission denied. You forgot to put a
grant statement in your script.

## Solution

The trivial solution is, of course, `GRANT EXECUTE ON {your proc
name} TO PUBLIC`. Slightly less trivial is to grant to a specific role, but most
people needing this tip will only be using PUBLIC.

Wouldn't it be great to automate this for all stored procedures in the database?
Well, here you go:

<!-- truncate -->

```sql
DECLARE procs CURSOR FOR select [name] from sys.objects where type= 'p'
DECLARE @name as varchar(250)
DECLARE @stmt as varchar(1000)

OPEN procs

FETCH NEXT FROM procs INTO @name

WHILE @@FETCH_STATUS = 0
BEGIN

     SET @stmt = 'GRANT EXECUTE ON ' + @name + ' TO PUBLIC'
     EXEC(@stmt)

     PRINT @stmt

     FETCH NEXT FROM procs INTO @name

END

CLOSE procs
DEALLOCATE procs
```
