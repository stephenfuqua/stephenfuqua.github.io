---
title: Explicit Column Mappings for SqlBulkCopy
date: '2011-01-18 10:25:57 -0600'
slug: explicit_column
tags:
- tech
- dotnet
- programming

---

Recently, I received a code delivery that worked on our development server but
failed in unit tests on my box. The culprit was a method that transformed a
`List<T>` into a `DataTable` and used that `DataTable` to load data into
SQL Server using [SqlBulkCopy](http://msdn.microsoft.com/en-us/library/system.data.sqlclient.sqlbulkcopy.aspx).
Lesson: apply column mappings.

<!-- truncate -->

We went back and forth: "it doesn't work," I reported. "But it works on the dev
server," says the developer. Can we both be right? I rebuild the code from my
machine, where the unit test is not passing (due to an attempt to insert a value
into a calculated column). Install on the dev server. Works without error.

Next day I'm reviewing another application that uses `SqlBulkCopy`. Another
error. This time, data for one field is being inserted into another field. All
along I suspected that the explicit ColumnMappings were needed. Now with a
second data point, I went to look at the schema.

* On the dev server, the first table had the calculated column as the last field, but on mine the last two fields were flipped.
* An older version of the second table's create script did not have an identity field. It exists in production, but if the corrected script were not loaded on the developer's unit testing database, then the field would be missing. It is the first field in the table.

So, although I see nothing  stating this in the [documentation](http://msdn.microsoft.com/en-us/library/434atets.aspx),
it appears that the order of the columns in the destination table matters. In
fact, without explicitly mapping columns using the [ColumnMappings](http://msdn.microsoft.com/en-us/library/system.data.sqlclient.sqlbulkcopy.columnmappings.aspx)
property, the source and destination are matched by index, rather than column
name. Thus if `Table1` is defined as `(Field1 varchar(10), Field2 varchar(10))`
and it is loaded using `Object2 { string Field2; string Field1 }`, then the
values loaded into the database will be flipped, `Object2.Field2` &rarr;
`Table1.Field1`. Add an explicit mapping and now it works.
