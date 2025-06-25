---
title: Summary of Useful Features in SQL Server 2008
date: '2008-03-04 10:29:28 -0600'
tags:
- tech
- database
- sql-server
---

SQL Server 2008 will be coming out sometime this summer (in theory). At last
week's TechFuse (dead link removed; SF 2025) event in
Minneapolis, and in blogs I sometimes read, I've started to pick up on a number
of useful features and improvements that should make one strongly consider
upgrading when the Release to Market (RTM) is ready (certainly this is not
all-inclusive):

<!-- truncate -->

## Encryption at rest

Whole databases can be encrypted with a master key (which can be stored in an
HSM), rather than encrypting by each column. No code changes are required, hence
this feature is called Transparent Data Encryption. It gives true encryption of
data at rest, included backup files.

* Blog: [Implementing Transparent Data Encryption in SQL Server 2008](https://www.mssqltips.com/sqlservertip/1507/implementing-transparent-data-encryption-in-sql-server-2008/)
* Books Online: [Understanding Transparent Data Encryption (TDE)](https://learn.microsoft.com/en-us/sql/relational-databases/security/encryption/transparent-data-encryption?view=sql-server-ver17)

## Filtered indexes

An index can be created with a filter (i.e. index all rows where MyDateField is
not null), thus making much more meaningful indexes &rarrow; improved
performance.

* Blog: SQL Server 2008 filtered indexes in 5 minutes (dead link removed; SF 2025)
* Books Online: [Filtered Index Design Guidelines](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-index-design-guide?view=sql-server-ver17)

## Sparse columns support

There are times when you want to create say 20 columns, only a portion of which
will be used at any given time (perhaps there are multiple applications using
the table, and they each have a few unique needs). If you create all these
columns, your table becomes a little unwieldy in many ways. You can use an XML
column to store just the subset required, or in 2008 you can use the new sparse
columns feature. This will improve indexing and manageability.

* Blog: [SQL Server 2008 Sparse Columns](https://www.kodyaz.com/articles/sql-server-2008-sparse-columns.aspx)
* Books Online: [SQL Server 2008 Sparse Columns](https://learn.microsoft.com/en-us/sql/relational-databases/tables/use-sparse-columns?view=sql-server-ver17)

## Performance Data Collector

The new Performance Data Collector stores query information in a data warehouse,
making it easy to answer questions like "whose query was hogging the resources
this morning, causing my job to get a timeout?"

* Blog: Creating a custom data collection in SQL Server 2008 (dead link removed; SF 2025)
* Books Online: Introducing the Data Collector (dead link removed; SF 2025)

## Resource Governor

Allows the administrator to allocate resource slices to different users or
classes of users; thus for instance you could specify that the core processing
user would always get (if needed) a minimum of 40% of the CPU & RAM, and you
could specify that the marketing users (once they have beefy report models to
work with) never get more than 10% of the resources. For example.

* Blog: SQL 2008 Resource Governor (dead link removed; SF 2025)
* Books Online: [Resource Governor Monitoring](https://learn.microsoft.com/en-us/sql/relational-databases/resource-governor/resource-governor-walkthrough?view=sql-server-ver17)

## Report Builder

The Reporting Services Report Builder has been entirely redesigned &mdash; now
looks like an Office 2007 application. The table and matrix controls have been
replaced with a far more flexible [tablix](https://msdn2.microsoft.com/en-us/library/bb934258(SQL.100).aspx)
control that allows you to do all kinds of cool things. There is still a [Visual
Studio-integrated](https://msdn2.microsoft.com/en-us/library/ms159253(SQL.100).aspx) Report Designer, though the things I've heard had left me
confused on that point (BOL may be out of date, or the presentation at TechFuse
was wrong?). The blog link below clears up the confusion.

* Blog: [Transmissions from the Satellite Heart (What's up with Report Builder?)](https://learn.microsoft.com/en-us/archive/blogs/bwelcker/transmissions-from-the-satellite-heart-whats-up-with-report-builder)
* Books Online: [Designing and Implementing Reports Using Report Builder](https://learn.microsoft.com/en-us/sql/reporting-services/report-design/report-design-tips-report-builder-and-ssrs?view=sql-server-ver16)

## Integration Services

These upgrades are basically in the area of performance improvements,
particularly with regard to the Lookup data flow task. Other improvements / new
functionality: ADO.Net as default data source (rather than OLEDB); data
profiling task; C# as new / default language for scripting tasks.

* Blog: SSIS: Big improvements to Lookup in SQL Server 2008 (dead link removed; SF 2025)
* Blog: C# comes to the script task/component (dead link removed; SF 2025)
* Blog: [What's new in SQL Server 2008 for SSIS - Part one](https://techcommunity.microsoft.com/blog/ssis/whats-new-in-sql-server-2008-for-ssis---part-one/387375)
* Blog: [What's new in SQL Server 2008 for SSIS - Part two](https://techcommunity.microsoft.com/blog/ssis/whats-new-in-sql-server-2008-for-ssis---part-two/387385)

## Transact SQL / Database Engine

Finally, we get to the heart of SQL Server: the structured query language.
Supposedly this thing is much faster. There is some new syntax available:
`GROUPING SETS` for enhanced BI-type queries; `MERGE` to perform inserts,
updates, and deletes in one statement; the`+=` operator, and more. There's also
the new Change Data Capture for enhanced auditability and better incremental
bulk loads.

* Blog: [GROUPING SETS in SQL Server 2008](https://learn.microsoft.com/en-us/archive/blogs/craigfr/grouping-sets-in-sql-server-2008)
* Blog: [SQL Server 2008 'Katmai' Change Data Capture (CDC) in SSIS](https://weblogs.sqlteam.com/derekc/2008/01/28/60469/)
* Books Online: [How Change Data Capture Works](https://msdn2.microsoft.com/en-us/library/bb522657(SQL.100).aspx)
* Books Online: [Using GROUP BY with ROLLUP, CUBE, and GROUPING SETS](https://msdn2.microsoft.com/en-us/library/bb522495(SQL.100).aspx)
* Books Online: [MERGE](https://msdn2.microsoft.com/en-us/library/bb510625(SQL.100).aspx)
