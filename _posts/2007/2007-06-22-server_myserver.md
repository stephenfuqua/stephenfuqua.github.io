---
layout: page
title: Server 'myserver' is not configured for RPC
date: '2007-06-22 18:25:07 -0500'
basename: server_myserver
tags: [tech, database, sql-server]
excerpt_separator: <!--more-->
---

**Problem:** On a Microsoft SQL Server 2005 installation with a linked server
configured to "myserver" (which happens to be 2000), execution of a remote
stored procedure (`EXEC myserver.mydatabase.dbo.mysproc`) fails with error:

```none
Msg 7411, Level 16, State 1, Line 1
Server 'myserver' is not configured for RPC.
```

<!--more-->


**Solution:** Problem is most likely that RPC is not configured for your linked
server. That is not a default option, after all. You can see what settings are
configured with `exec <a
href="http://msdn2.microsoft.com/en-us/library/ms189804.aspx">sp_helpserver</a>`,
run on the client server (not the linked server).

If 'rpc,rpc out' is not in your results, then the the linked server isn't
configured for RPC. To do so, run these two commands on the client server:

```sql
exec sp_serveroption @server='myserver', @optname='rpc', @optvalue='true'
exec sp_serveroption @server='myserver', @optname='rpc out', @optvalue='true'
```

## Comments

_imported from old Movable Type blog_

> author: Kshitij Punjani<br>
> date: '2007-06-25 15:42:17 -0500'
>
> Nice way out!
