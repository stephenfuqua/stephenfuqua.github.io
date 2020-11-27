---
layout: page
title: Encryption, Views, and Stand-Alone Stored Procedures in the Entity Framework
date: '2009-08-26 11:12:48 -0500'
basename: encryption_view
tags:
- tech
- database
- sql-server
- dotnet
excerpt_separator: <!--more-->
---

**Problem:** You have an table with encrypted columns. In the ADO.Net Entity
Framework, you can't directly write an update to this table, since it does not
handle the encryption commands. Furthermore, the framework will not return
meaningful information, since it cannot decrypt the data. Finding the solution
to this has been an adventure.

<!--more-->

Let's give this as the table structure:

| ADDRESS |
| -- |
| ADDRESS_ID INT IDENTITY(1,1) PRIMARY KEY |
| ADDRESS_LINE_1 VARBINARY(8000) |
| ADDRESS_LINE_2 VARBINARY(8000) |
| CITY VARBINARY(8000) |
| STATE VARBINARY(8000) |
| ZIP VARBINARY(8000) |
| COUNTRY_CODE VARBINARY(8000) |
| ANOTHER_ID INT {a foreign key} |

## View with Stored Procedures

The first solution was to create a view that would decrypt the data. In the
Entity Framework, we need to import the view rather than the table. Then, create
three stored procedures: ADDRESS_INSERT, ADDRESS_UPDATE, and ADDRESS_DELETE. No
explanation really needed for these stored procedures. <a
href="http://blogs.microsoft.co.il/blogs/bursteg/archive/2007/12/17/ado-net-entity-framework-tools-stored-procedures.aspx">Map
the stored procedures</a> to the view. Works beautifully in some cases. But...

Because this is a view without a primary key, the Entity Framework needs to
infer the proper primary key. And sometimes it does not do so correctly. For
instance, in the current example, it might guess that the primary key is the
combined (ADDRESS_ID, ANOTHER_ID) fields. In that case, the Entity Framework may
get "confused" and not be able to run the insert, giving a message "Unable to
determine a valid ordering for dependent operations." What to do?

Well, you can edit the CSDL to correct the primary key - but as soon as you do a
Database Update, then it will go back to the incorrectly-inferred primary key.
So this solution really doesn't work. These issues are discussed in an <a
href="http://social.msdn.microsoft.com/Forums/en-US/adodotnetentityframework/thread/ea0bf748-bc97-439d-99b0-76180b2161bb/">
MSDN forum posting</a>.

## Independently Mapping the Insert Stored Procedure

Taking a different route, you can define a stand-alone function that will
execute the stored procedure (see "Map Query Functions" in the <a
href="http://blogs.microsoft.co.il/blogs/bursteg/archive/2007/12/17/ado-net-entity-framework-tools-stored-procedures.aspx">
stored procedures mapping</a> link). This turns out to be rather simple, but
figuring this out took me quite a few hours to muddle through, because the <a
href="http://msdn.microsoft.com/en-us/library/bb399203.aspx">Microsoft
documentation</a> didn't make some of the limitations of the Entity Framework
clear.

Creating the function for the stored procedure was easy - I created a function
import (InsertAddress linked to ADDRESS_INSERT) that returns an Int, which is
the new record's ID value (my stored procedure's last step is ` SELECT
SCOPE_IDENTITY()`). Accessing the function was the hard part: the MS
documentation I could find made it look easy, but the function simply wasn't
available to me. My entity container is called UnitTestEntities. The sample
documentation made it look like I could simply instantiate a UnitTestEntities
object and call InsertAddress on it:

```csharp
using (UnitTestEntities db = new UnitTestEntities())
{
    db.InsertAddress(...);
}
```

But InsertAddress doesn't exist. Why? Because in my case it returns a scalar 
rather than an Entity. The solution is that you must hand-code the C# 
representation of the function. You see, when it was added to the model, it was 
just in XML  - there is no link in C#.

## Creating the Custom Function in C#

Finally I found helpful documentation: How to:
<a href="http://msdn.microsoft.com/en-us/library/dd296754.aspx">Define Custom 
Functions in the Storage Model</a>.

It turns out that the Entity Framework is essentially its own database layer. So
now you need to write a function that queries the Entity Framework, which will
pass the query on to the database via the imported function.

In my Visual Studio project, I created a new file that would hold a partial
class for my UnitTestEntities class (I didn't want to edit the file managed by
Visual Studio and the Model itself). In this file, import the
System.Data.EntityClient namespace instead of System.Data.SqlClient namespace.
Then write an stored procedure call similar to a SQL stored procedure, using as
the CommandText the name of the container and the name of the imported function.
The function should accept the entity object as a parameter and should set the
identity field's value based on the stored procedure call's result.

```csharp
public void InsertRecord(ADDRESS record)
{
    DbCommand command = this.Connection.CreateCommand();
    command.CommandType = CommandType.StoredProcedure;
    command.CommandText = this .DefaultContainerName + "." + "InsertAddress";

    command.Parameters.Add(new EntityParameter ("ADDRESS_LINE_1", DbType.String) { Value = record.ADDRESS_LINE_1 });
    command.Parameters.Add(new EntityParameter ("ADDRESS_LINE_2", DbType.String) { Value = record.ADDRESS_LINE_2 });
    command.Parameters.Add(new EntityParameter ("CITY", DbType.String) { Value = record.CITY });
    command.Parameters.Add(new EntityParameter ("STATE", DbType.String) { Value = record.STATE });
    command.Parameters.Add(new EntityParameter ("ZIP", DbType.String) { Value = record.ZIP });
    command.Parameters.Add(new EntityParameter ("COUNTRY_CODE", DbType.String) { Value = record.COUNTRY_CODE });
    command.Parameters.Add(new EntityParameter ("ANOTHER_ID", DbType.Int32) { Value = record.ANOTHER_ID });
    if (command.Connection.State == ConnectionState.Closed)
    {
	    command.Connection.Open();
    }
    try
    {
		  record.ADDRESS_ID = int.Parse(command.ExecuteScalar().ToString());
    }
    finally
    {
		  Connection.Close();
    }
} 
```
