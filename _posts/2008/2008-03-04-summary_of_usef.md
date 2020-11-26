---
layout: page
title: Summary of Useful Features in SQL Server 2008
date: '2008-03-04 10:29:28 -0600'
basename: summary_of_usef
tags:
- tech
- database
- sql-server
---

SQL Server 2008 will be coming out sometime this summer (in theory). At last
week's <a href="http://www.nhmn.com/techfuse/">TechFuse</a> event in
Minneapolis, and in blogs I sometimes read, I've started to pick up on a number
of useful features and improvements that should make one strongly consider
upgrading when the Release to Market (RTM) is ready (certainly this is not
all-inclusive):

<!--more-->

## Encryption at rest

Whole databases can be encrypted with a master key (which can be stored in an
HSM), rather than encrypting by each column. No code changes are required, hence
this feature is called Transparent Data Encryption. It gives true encryption of
data at rest, included backup files.

<ul>
<li>Blog: <a href="http://edge.technet.com/Media/580/">SQL Server 2008 Transparent Data Encryption</a></li>
<li>Books Online: <a href="http://msdn2.microsoft.com/en-us/library/bb934049(SQL.100).aspx">Understanding Transparent Data Encryption (TDE)</a></li>
</ul>

## Filtered indexes

An index can be created with a filter (i.e. index all rows where MyDateField is
not null), thus making much more meaningful indexes &rarrow; improved
performance.

<ul>
<li>Blog: <a href="http://www.statisticsio.com/Home/tabid/36/articleType/ArticleView/articleId/68/SQL-Server-2008-filtered-indexes-in-5-minutes.aspx">SQL Server 2008 filtered indexes in 5 minutes</a></li>
<li>Books Online: <a href="http://msdn2.microsoft.com/en-us/library/cc280372(SQL.100).aspx">Filtered Index Design Guidelines</a></li>
</ul>

## Sparse columns support

There are times when you want to create say 20 columns, only a portion of which
will be used at any given time (perhaps there are multiple applications using
the table, and they each have a few unique needs). If you create all these
columns, your table becomes a little unwieldy in many ways. You can use an XML
column to store just the subset required, or in 2008 you can use the new sparse
columns feature. This will improve indexing and manageability.

<ul>
<li>Blog: <a href="http://blogs.technet.com/andrew/archive/2008/02/28/sql-server-2008-sparse-columns.aspx">SQL Server 2008 Sparse Columns</a></li>
<li>Books Online: <a href="SQL Server 2008 Sparse Columns">SQL Server 2008 Sparse Columns</a></li>
</ul>

## Performance Data Collector

The new Performance Data Collector stores query information in a data warehouse,
making it easy to answer questions like "whose query was hogging the resources
this morning, causing my job to get a timeout?"

<ul>
<li>Blog: <a href="http://www.statisticsio.com/Home/tabid/36/articleType/ArticleView/articleId/57/Default.aspx">Creating a custom data collection in SQL Server 2008</a></li>
<li>Books Online: <a href="http://msdn2.microsoft.com/en-us/library/bb677248(SQL.100).aspx">Introducing the Data Collector</a></li>
</ul>

## Resource Governor

Allows the administrator to allocate resource slices to different users or
classes of users; thus for instance you could specify that the core processing
user would always get (if needed) a minimum of 40% of the CPU & RAM, and you
could specify that the marketing users (once they have beefy report models to
work with) never get more than 10% of the resources. For example.

<ul>
<li>Blog: <a href="http://portal.sqltrainer.com/2007/12/sql-2008-resource-governor.html">SQL 2008 Resource Governor</a></li>
<li>Books Online: <a href="http://msdn2.microsoft.com/en-us/library/bb933941(SQL.100).aspx">Resource Governor Monitoring</a></li>
</ul>

## Report Builder

The Reporting Services Report Builder has been entirely redesigned &mdash; now
looks like an Office 2007 application. The table and matrix controls have been
replaced with a far more flexible <a
href="http://msdn2.microsoft.com/en-us/library/bb934258(SQL.100).aspx">tablix</a>
control that allows you to do all kinds of cool things. There is still a <a
href="http://msdn2.microsoft.com/en-us/library/ms159253(SQL.100).aspx">Visual
Studio-integrated</a> Report Designer, though the things I've heard had left me
confused on that point (BOL may be out of date, or the presentation at TechFuse
was wrong?). The blog link below clears up the confusion.

<ul>
<li>Blog: <a href="http://blogs.msdn.com/bwelcker/archive/2007/12/11/transmissions-from-the-satellite-heart-what-s-up-with-report-builder.aspx">Transmissions from the Satellite Heart (What's up with Report Builder?)</li>
<li>Books Online: <a href="http://msdn2.microsoft.com/en-us/library/ms159750(SQL.100).aspx">Designing and Implementing Reports Using Report Builder</a></li>
</ul>

## Integration Services

These upgrades are basically in the area of performance improvements,
particularly with regard to the Lookup data flow task. Other improvements / new
functionality: ADO.Net as default data source (rather than OLEDB); data
profiling task; C# as new / default language for scripting tasks.

<ul>
<li>Blog: <a href="http://blogs.conchango.com/jamiethomson/archive/2007/08/21/SSIS_3A00_-Big-improvements-to-Lookup-in-SQL-Server-2008.aspx">SSIS: Big improvements to Lookup in SQL Server 2008</a></li>
<li>Blog: <a href="http://blogs.conchango.com/jamiethomson/archive/2007/06/09/Katmai_5C00_SSIS_3A00_-C_2300_-comes-to-the-script-task_2F00_component.aspx">C# comes to the script task/component</a></li>
<li>Blog: <a href="http://blogs.msdn.com/mattm/archive/2008/01/10/what-s-new-in-sql-server-2008-for-ssis-part-one.aspx">What's new in SQL Server 2008 for SSIS - Part one</a></li>
<li>Blog: <a href="http://blogs.msdn.com/mattm/archive/2008/01/22/what-s-new-in-sql-server-2008-for-ssis-part-two.aspx">What's new in SQL Server 2008 for SSIS - Part two</a></li>
</ul>

## Transact SQL / Database Engine

Finally, we get to the heart of SQL Server: the structured query language.
Supposedly this thing is much faster. There is some new syntax available:
`GROUPING SETS` for enhanced BI-type queries; `MERGE` to perform inserts,
updates, and deletes in one statement; the`+=` operator, and more. There's also
the new Change Data Capture for enhanced auditability and better incremental
bulk loads.

<ul>
<li>Blog: <a href="http://blogs.msdn.com/craigfr/archive/2007/10/11/grouping-sets-in-sql-server-2008.aspx">GROUPING SETS in SQL Server 2008</a></li>
<li>Blog: <a href="http://weblogs.sqlteam.com/derekc/archive/2008/01/28/60469.aspx">SQL Server 2008 'Katmai' Change Data Capture (CDC) in SSIS</a></li>
<li>Books Online: <a href="http://msdn2.microsoft.com/en-us/library/bb522657(SQL.100).aspx">How Change Data Capture Works</a></li>
<li>Books Online: <a href="http://msdn2.microsoft.com/en-us/library/bb522495(SQL.100).aspx">Using GROUP BY with ROLLUP, CUBE, and GROUPING SETS</a></li>
<li>Books Online: <a href="http://msdn2.microsoft.com/en-us/library/bb510625(SQL.100).aspx">MERGE</a></li>
</ul>

## Comments

_imported from old Movable Type blog_

> author: Derek Comingore\
> date: '2008-06-13 19:56:34 -0500'\
> url: http://weblogs.sqlteam.com/derekc
>
> Thanks for the reference.
>
> Cheers
> Derek
