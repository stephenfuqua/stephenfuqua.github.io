---
title: Replacing Ad Hoc Query Text When Fields Change
date: '2007-06-27 17:10:47 -0500'
slug: replacing_ad_ho
tags: [tech, database, sql-server]
excerpt_separator: <!-- truncate -->
---

**Situation:** We have a stored procedure running a query whose `WHERE` clause is
given as a parameter. No, that's not the problem in and of itself, at least not
today. (Treat this as a non-negotiable requirement for now). Within that
WHERE clause there might be a query against a field, call it myField. This field
is a varchar and wildcards are not used. Platform: SQL Server 2005.

**Problem:** myField has been changed to a varbinary field and holds an
encrypted value &mdash; thus can no longer query directly against it. How do we
make this work?

<!-- truncate -->

**Solution:** First a tangent &mdash; querying against a hash value. Right now
we'd have to decrypt every single value of myField, compare it to the `WHERE`
clause, and  see if we had a match. Yuk. Big drawback of encryption. Thankfully,
there's another way &mdash; save a unique and irreversible hash of the encrypted
value and then compare against this.

Thus I have an additional column called `myFieldHashed`. When I save data to
myField, I also take the raw data, run it through a hashing algorithm with the
T-SQL HashBytes command, and save that value. Now my query against myField will
no longer be `DECRYPT_COMMAND(myField) = '<some value>'`, but rather
`myFieldHash = HashBytes('algo', '<some value>')`. (`DECRYPT_COMMAND` is not a
real SQL command, just a lazy substitute).

Unfortunately neither methods work right now &mdash; hashing or decrypting
&mdash; because the WHERE clause will not contain either the decrypt command or
the HashBytes command.

What we need to do is extract anything that looks like `myField = '<some
value>'` and replace it with the proper command. A caveat: if there are nested
AND or OR statements, this phrase could be repeated. Repetition indicates that
we might want to use a UDF that can be called recursively.

So let's get to it. First let's create a temp table upon which to operate:

```sql
CREATE TABLE #Temp (myField varchar(6), myFieldHash varchar(256), anotherField varchar(1))
INSERT INTO #Temp (myField, myFieldHash, anotherField) SELECT 'value1', HashBytes('MD2','value1'), '1'

INSERT INTO #Temp (myField, myFieldHash, anotherField) SELECT 'value2', HashBytes('MD2','value2'), '2'
INSERT INTO #Temp (myField, myFieldHash, anotherField) SELECT 'value3', HashBytes('MD2','value4'), '3'
SELECT * FROM #temp
```

And here's a WHERE clause that might be passed into our stored procedure:

```sql
DECLARE @WHERE as VARCHAR(1000), @stmt as VARCHAR(1000)
SET @WHERE = 'WHERE (myField = ''value1'' AND anotherField = ''1'') OR (myField = ''value3'')'
```

Need to extract the `myField = 'xxx'` portion and later insert a new clause in the
exact same position. Thus must preserve string before and after this clause, and
need to know the position of the word "myField" and of the two apostrophes
surrounding the criteria in order to isolate that criteria. Declare some
variables.

```sql
DECLARE @before as varchar(1000), @after as varchar(1000), @criteria as varchar(1000), @pos_myField as INT, @pos_APOS_1 as INT, @pos_APOS_2 as INT
```

Find `myField = `, assuming there are spaces around `=`. And since we'll be
replacing `myField` with `myFieldHash`, make sure to capture the space and equal
after `myField` so as to not accidentally match `myFieldHash`.

```sql
SET @pos_myField = CHARINDEX('myField = ', @WHERE)
```

First apostrophe after `myField`:

```sql
SET @pos_APOS_1 = CHARINDEX('''', @WHERE, @pos_myField + 1)
```

Now the second apostrophe:

```sql
SET @pos_APOS_2 = CHARINDEX('''', @WHERE, @pos_APOS_1  + 1)
```

Now extract the three parts:

```sql

SET @before = SUBSTRING(@WHERE, 1, @pos_myField - 1)
SET @criteria = SUBSTRING(@WHERE, @pos_APOS_1 + 1, @pos_APOS_2 - @pos_APOS_1 - 1)
SET @after = SUBSTRING(@WHERE, @pos_APOS_2 + 1, LEN(@WHERE)-@pos_APOS_2)
```

Rebuild with `HASH` field name

```sql
SET @return = @before + ' myFieldHash = HashBytes(''MD2'', ''' + @criteria + ''') ' + @after
```

Try that out now, if you like! You'll find that it works as expected &mdash; on
the first `myField` criteria anyway. There might be a better solution out there,
but this is the one I've come up with and it does the trick =).

Now we need to get the second. While I initially suggested that this might be a
recursive function, perhaps it would be better to simply put a loop into the
function.

```sql
WHILE (@pos_myField <> 0)
```

End result:

```sql

CREATE FUNCTION dbo.fnFixMyFieldAdHoc(@WHERE varchar(1000))
RETURNS varchar(1000)
AS

BEGIN

     DECLARE @return as varchar(1000)
     SET @return = @WHERE


     DECLARE @before as varchar(1000), @after as varchar(1000), @criteria as varchar(1000), @pos_myField as INT, @pos_APOS_1 as INT, @pos_APOS_2 as INT

     SET @pos_myField = CHARINDEX('myField = ', @return)

     WHILE (@pos_myField <> 0)
     BEGIN

          SET @pos_APOS_1 = CHARINDEX('''', @return, @pos_myField + 1)

          SET @pos_APOS_2 = CHARINDEX('''', @return, @pos_APOS_1  + 1)

          SET @before = SUBSTRING(@return, 1, @pos_myField - 1)
          SET @criteria = SUBSTRING(@return, @pos_APOS_1 + 1, @pos_APOS_2 - @pos_APOS_1 - 1)
          SET @after = SUBSTRING(@return, @pos_APOS_2 + 1, LEN(@return)-@pos_APOS_2)

          SET @return = @before + ' myFieldHash = HashBytes(''MD2'', ''' + @criteria + ''') ' + @after

          SET @pos_myField = CHARINDEX('myField = ', @return)

     END

     RETURN @return


END
GO

GRANT EXECUTE ON fnFixMyFieldAdHoc TO PUBLIC
GO
```

Now we can test out the function:

```sql
SET @WHERE = dbo.fnFixMyFieldAdHoc(@WHERE)

PRINT @WHERE
SET @stmt = 'SELECT * FROM #Temp ' + @WHERE
PRINT @stmt
exec (@stmt)
```

And let's also make sure the function does not error out if there are _no instances_ of "myField":

```sql
SET @WHERE = 'WHERE anotherField = ''1'''
SET @WHERE = dbo.fnFixMyFieldAdHoc(@WHERE)
PRINT @WHERE
SET @stmt = 'SELECT * FROM #Temp ' + @WHERE
PRINT @stmt
exec (@stmt)
```

Now we have our solution. It could be done in a more robust fashion using
regular expressions (i.e. would be able to handle `myField = ` as well as
`myField=`), but that would require CLR integration and I'm just not ready to go
to that extreme.

Note: MD2 has [not been
considered secure](http://en.wikipedia.org/wiki/MD2_%28cryptography%29#Security) since 2004. You should choose a better algorithm than
this.
