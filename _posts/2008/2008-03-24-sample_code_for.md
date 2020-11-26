---
layout: post
title: Sample Code for Using the XML Datatype in SQL Server 2005
date: '2008-03-24 16:27:48 -0500'
basename: sample_code_for
tags:
- tech
- database
- sql-server
---

I mentioned using the XML datatype for sparse column support in my recent post
on some of the <a
href="://www.safnet.com/writing/tech/archives/2008/03/summary_of_usef.html">Useful
Features in SQL Server 2008</a>. Until today I had never had an opportunity to
actually use this feature. I was pleasantly surprised at how easy it was to use,
especially with some help from Itzik Ben-Gan's <a
href="http://www.sql.co.il/books/insidetsql2005/">Inside SQL Server 2005: T-SQL
Programming</a>.

**Problem:** I've begun using data-driven subscriptions in SQL Server Reporting
Services. I want to create one table to house subscription data. Various reports
will have different parameters, both in number and kind. It is impractical to
create one column for each possible parameter, and seems senseless to create a
separate table for every report.

<!--more-->

**Solution:** Create a single XML column that can hold any data. Each report
will get its own schema for specifying the subscription parameters. To
demonstrate the SQL, let's create a temporary table and some useful queries:

```sql
create table #sub (id int identity, xval XML)
```

Now add a few records to it, assuming that the report has two parameters: one
called myID and a list of recipients (note the user of `N'` for nvarchar):

```sql
insert into #sub (xval) values (N'
<subscription>
     <myID>12345</myID>
     <recipients>s1@donotreply.com</recipients>
</subscription>
')
insert into #sub (xval) values (N'
<subscription>
     <myID>23456</myID>
     <recipients>s234234@donotreply.com</recipients>
</subscription>
')
```

Retrieve the values, separating the `myID` and `recipient` nodes into two
separate columns using <a href="http://www.w3.org/TR/xpath">XPATH</a> queries:

```sql
select id,
xval.value('(/subscription/myID)[1]', 'varchar(9)') as myID, 
xval.value('(/subscription/recipients)[1]', 'varchar(500)') as recipients
from #sub
```

How about searching for a specific record?

```sql
select id, xval from #sub where xval.value('(/subscription/myID)[1]','varchar(9)') = N'12345'
```

The performance of that query will be improved with addition of proper <a
href="http://msdn2.microsoft.com/en-us/library/ms345121.aspx">XML indexes</a>,
which require that the table have a primary key:

```sql
alter table #sub add constraint pk_sub primary key clustered (id);
create primary xml index IX_XML_Primary ON #sub(xval)
create xml index IX_XML_Property on #sub(xval) using xml index ix_xml_primary for property
```
