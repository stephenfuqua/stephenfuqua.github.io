---
layout: page
title: Protecting Against SQL Injection in Dynamic SQL Statements
date: '2011-02-26 11:42:16 -0600'
basename: protecting_agai
tags:
- tech
- database
- sql-server
excerpt_separator: <!--more-->
---

Microsoft's Books Online article on <a href=
"http://msdn.microsoft.com/en-us/library/ms161953%28v=SQL.90%29.aspx"> SQL
Injection</a> does a great job of reviewing the possible attacks against dynamic
SQL statements (using `EXEC` or `sp_executesql`). I won't re-hash their discussion
and suggestions. What I offer below is a sample remediation effort for this set
of statements (the `@Fields` and `@Values` variables are actually stored procedure
parameters):

```sql
DECLARE @Fields VARCHAR(1000), @VALUES VARCHAR(1000), @SQL NVARCHAR(2500);
SELECT @SQL = 'INSERT INTO MyTable (' + @Fields + ') VALUES (' + @Values + ')';
EXEC(@SQL);
```

<!--more-->

This represents the heart of what this stored procedure does. To protect against
SQL Injection, I first added a section of code that checks to make sure that all
of the fields in @Fields are real fields &mdash; this is positive input
validation:

```sql
CREATE TABLE #temp (Field NVARCHAR(200)) 

INSERT INTO #temp(Field)
SELECT QUOTENAME(Field) FROM dbo.fnSplitString(@Fields,',')   

-- Validate that all fields are real fields in the table
IF EXISTS (SELECT  1 FROM #temp t WHERE NOT EXISTS
                     (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS c WHERE c.TABLE_NAME = 'MyTable'
                           AND QUOTENAME(c.COLUMN_NAME) = t.Field))
BEGIN
       DECLARE @v_strMessage AS NVARCHAR(500);

       SELECT @v_strMessage = 'Invalid  field(s) in the @Fields parameter detected: ';
       SELECT @v_strMessage = @v_strMessage  + QUOTENAME(t.Field) + ', '
            FROM #tempOrderField t WHERE NOT EXISTS
                           (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS c WHERE c.TABLE_NAME = 'MyTable'
                                  AND QUOTENAME(c.COLUMN_NAME) = QUOTENAME(t.Field));
       RAISERROR(@v_strMessage, 17, 0);
END
```

If there are any invalid fields, then they will all be listed in an error
message and the stored procedure will stop executing. Note that all of the
fields are note &ldquo;quoted&rdquo; by the `QUOTENAME` function. Next, the
@VALUES needs to be protected. In this case, the application may send an
apostrophe in the data, legitimately. So I use the Replace statement twice
&mdash; once to guard against stray single quotes, and a second time to overcome
incorrectly doubled apostrophes.

```sql
INSERT INTO #temp2 (Values)
SELECT REPLACE(REPLACE(Field, '''', ''''''), '''''', '''') FROM dbo.fnSplitString(@VALUES,',')
```

Finally, to avoid buffer overflows, I change the @SQL to `NVARCHAR(MAX)`. In
general it is better to use `sp_executesql` instead of `EXEC`, so I also change
to that. In this case I can&rsquo;t benefit from it (exercise for the reader to
understand why), but I still use it out of good habit.

```sql
DECLARE @v_strSql NVARCHAR(MAX) -- statement needs 5028 characters, but to protect from buffer overflows, changing to MAX
SELECT @v_strSql = N'INSERT INTO dbo.MyTable ('

-- add  the fields
SELECT @v_strSql = @v_strSql + Field + ', ' FROM #temp;

-- remove extra comma and add VALUES()
SELECT @v_strSql = SUBSTRING(@v_strSql, 1, LEN(@v_strSql) - 1) + ') VALUES (';

-- add the values
SELECT @v_strSql = @v_strSql +  Value + ', ' FROM #temp2;

-- again remove extra comma and close VALUES()
SELECT @v_strSql = SUBSTRING(@v_strSql, 1, LEN(@v_strSql) - 1) + ');';

EXEC sp_executesql @v_strSql;
```

In summary, four changes were applied, as suggested by Microsoft:

<ul>
<li>Validated input data where I could (the field listing)</li>
<li>"Quoted" fields with `QUOTENAME` (can be done for
fields in INSERT, SELECT, ORDER BY, etc.)</li>
<li>Doubled-up on the apostrophes</li>
<li>Tried to protect against buffer overflow</li>
</ul>

Before making these changes, I made sure that I had automated unit tests that
were passing with the old version. After updates, and a few bug fixes, the unit
tests are again passing. I also wrote unit tests that included bad data to make
sure everything still worked fine.
