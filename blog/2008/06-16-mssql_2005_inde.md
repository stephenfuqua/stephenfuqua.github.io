---
title: 'MSSQL 2005: Indexed Views'
date: '2008-06-16 14:39:35 -0500'
tags:
- tech
- sql-server
---

Good article on using indexed views: [Indexed
Views Basics in SQL Server](https://www.databasejournal.com/ms-sql/indexed-views-basics-in-sql-server-2000/). Similar good coverage in Ben-Gan's _Inside
Microsoft SQL Server 2005: T-SQL Programming_. Problem: both specify that the
hint `WITH(NOEXPAND)` needs to be used when executing a query against the index
on anything other than Enterprise and Developer. However, I've found that it is
also required for Enterprise.

<!-- truncate -->
