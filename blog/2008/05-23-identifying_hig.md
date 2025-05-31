---
title: Identifying Highly Fragmented (and important) Indexes
date: '2008-05-23 22:10:08 -0500'
slug: identifying_hig
tags:
- tech
- database
- sql-server
---

## Problem

SQL Server 2005 queries that used to be fast are now rather slow.
You've already tuned the query with good indexes and optimized structures.
You've checked the running jobs with Activity Monitor and don't see anything
that should be slowing down the server. Likewise you've checked the memory and
CPU utilization and they don't seem out of line. Did you check the indexes
fragmentation? Ah, there's the problem &mdash; a highly fragmented index was
slowing things down. Is there a way to pre-emptively find and fix these?

<!-- truncate -->

## Problem

SQL Server 2005 queries that used to be fast are now rather slow.
You've already tuned the query with good indexes and optimized structures.
You've checked the running jobs with Activity Monitor and don't see anything
that should be slowing down the server. Likewise you've checked the memory and
CPU utilization and they don't seem out of line. Did you check the indexes
fragmentation? Ah, there's the problem &mdash; a highly fragmented index was
slowing things down. Is there a way to pre-emptively find and fix these?

## Solution

SQL Server MVP Lara Rubbelke has addressed procedures for
scheduling index de-fragmentation in a few places:

* Smart Index Defragmentation for an ONLINE World (dead link removed; SF 2025)
* Smart Index Defrag/Reindex for a Consolidated SQL Server 2005 Environment (dead link removed; SF 2025)

These solutions are great for automation. But when you're crunched for time,
implementing and testing automatic solutions might be too much to handle. It
might pay off to do some quick-hit analysis, identifying the worst fragmentation
problems and solving those first. Let's start with a look at the [dynamic management
view](https://msdn.microsoft.com/en-us/library/ms188754.aspx) that provides fragmentation statistics: [`dm_db_index_physical_stats`](https://msdn.microsoft.com/en-us/library/ms188917.aspx).
There are five arguments. For this purpose, it is useful to supply the Database
ID for the specific database in question. Don't know it? try:

```sql
  select * from sys.databases

  -- Database of interest is 7
  -- supply null for the rest:
  select * from sys.dm_db_index_physical_stats(7,null,null,null,null)
```

Of course, the output really isn't all that useful yet &mdash; which indexes are
these? To get the name of the index, and the table to which it applies, you can
join to `sys.objects` and `sys.indexes`. It is also helpful to pick out only the
most useful columns, and sort by fragmentation.

```sql
select obj.[name], ind.[name], frag.avg_fragmentation_in_percent, frag.fragment_count, frag.avg_fragment_size_in_pages, frag.page_count
from sys.dm_db_index_physical_stats(7,null,null,null,null) frag
inner join sys.objects obj on frag.object_id = obj.object_id
inner join sys.indexes ind on frag.index_id = ind.index_id and frag.object_id = ind.object_id
order by frag.avg_fragmentation_in_percent desc
```

Finally, to have the most impact, it might be useful to pull in usage statistics
to find the indexes that are used the most, employing the
`sys.dm_db_index_usage_stats` management view. Since this is for quick
evaluation, I like to combine the Seeks, Scans, and Lookups into one column. In
this next version, let's also cut out anything that is less than 70% fragmented,
so that we can really hone in on the indexes with the greatest impact. Finally,
let's only looked at frequently used indexes, with at least 100,000 seeks,
scans, and lookups.

```sql
select obj.[name], ind.[name], frag.avg_fragmentation_in_percent, frag.fragment_count, frag.avg_fragment_size_in_pages, frag.page_count, usage.user_seeks + usage.user_scans + usage.user_lookups as user_x
from sys.dm_db_index_physical_stats(7,null,null,null,null) frag
inner join sys.objects obj on frag.object_id = obj.object_id
inner join sys.indexes ind on frag.index_id = ind.index_id and frag.object_id = ind.object_id
inner join sys.dm_db_index_usage_stats usage on frag.index_id = usage.index_id and frag.object_id = usage.object_id
where frag.avg_fragmentation_in_percent > 70
and usage.user_seeks + usage.user_scans + usage.user_lookups > 100000
order by avg_fragmentation_in_percent
```
