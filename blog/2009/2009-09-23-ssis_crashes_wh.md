---
title: SSIS Crashes When Editing OLE DB Source
date: '2009-09-23 09:49:26 -0500'
slug: ssis_crashes_wh
tags:
- tech
- database
- sql-server
- ssis

---

**Problem:** SSIS 2005 (actually, Microsoft SQL Server Business Intelligence
Studio) crashes every time you click on an OLE DB Source to edit it. (there are
probably similar errors for OLE DB destinations).

**Solution:** oddly enough, synchronize a few DLLs:

> Version of the assemblies 1msmdlocal.dll1 and `Msmgdsrv.dll` must be the same
> of the ones installed into "%ProgramFiles%\Microsoft Visual Studio
> 8\Common7\IDE\PrivateAssemblies\" and the ones installed into
> "%ProgramFiles%\Common Files\System\Ole DB" location.
>
> If it is not same for any or both of these DLLs, then replace the ones in
> `PrivateAssemblies` with the ones from `ole db`.

Hat tip: [Calculation
tab not working &mdash; SQL Server 2005 Analysis Services](http://munishbansal.wordpress.com/2009/05/28/calculation-tab-not-working---sql-server-2005-analysis-services/)
