---
title: Closing A Cursor in SQL Catch
date: '2009-06-29 10:42:42 -0500'
slug: closing_a_curso
tags:
- tech
- database
- sql-server

---

**Problem:** In a T-SQL script, an exception occurs while a cursor is open,
resulting in the cursor never being closed. But, the exception handling wraps
the entire script, not just the cursor, so there is no guarantee that the cursor
will be open if/when the CATCH statement is reached.

**Solution:** query the sys.syscursors view to see if the cursor(s) in question
is still open:

<!-- truncate -->

```sql
BEGIN CATCH
     ...

     IF EXISTS (SELECT 1 FROM sys.syscursors WHERE cursor_name = 'MyCursor')
     BEGIN
 DEALLOCATE MyCursor
     END

     ...
END CATCH
```

## Update 7/14/09

I just tried to deploy this to a development environment, rather than my own
computer. There it was running as a user with restricted access. I received the
following error:`The SELECT permission was denied on the object 'syscursors',
database 'mssqlsystemresource', schema 'sys'."`

This was easily remedied when I finally discovered the [CURSOR_STATUS](https://technet.microsoft.com/en-us/library/ms177609.aspx)
function:

```sql
DECLARE @cursorstatus int;
SELECT @cursorstatus = cursor_status('global','MyCursor')
IF @cursorstatus > -2
BEGIN
     DEALLOCATE MyCursor
END
```
