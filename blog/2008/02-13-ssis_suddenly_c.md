---
title: 'SSIS: Suddenly Can''t Write to Buffer'
date: '2008-02-13 09:22:39 -0600'
slug: ssis_suddenly_c
tags:
- tech
- database
- sql-server
- ssis

---

**Problem:** periodically, one of my SSIS packages was throwing an error saying
`"The buffer manager cannot create a temporary storage file on any path in the
BufferTempStoragePath property. There is an incorrect file name or no
permission."` The package in question then would hang, locking a file that it
was trying to import.

<!-- truncate -->

**Solution:** The `BufferTempStoragePath` is kind of self explanatory. As usual,
Jamie Thomson's SQL Junkie blog has an excellent article that gives useful
background on the issue, in Dataflow mechanics (dead link removed; SF 2025). He also points to my other favorite SSIS reference,
_Microsoft SQL Server 2005 Integration Services_, by Kirk Haselden. Apparently
my package needed to write some data out to the buffer and did not have proper
permissions, just as the error says. So, where is this buffer? Neither THomson
nor Haselden address this, but Haselden does answer an asked question: why does
my package usually succeed, only rarely failing? "The Data Flow Task only uses
the `BufferTempStoragePath` when it runs out of memory and must spool buffers
out to disk." (p422)

In a [random
forum](https://forums.microsoft.com/MSDN/ShowPost.aspx?PostID=552382&SiteID=1) I found someone mentioning that the default buffer location is in
`c:\documents and settings\<username>\...`. Well, there's my problem &mdash; the
user executing the package does not have such a directory. No wonder it failed.
Thankfully there is an override at the package level: you can directly set the
path in a `Data Flow` diagram's properties.
