---
layout: post
title: Ignoring SSIS Data Conversion Failures
date: '2007-08-17 20:39:51 -0500'
basename: ignoring_ssis_d
tags: [tech, database, sql-server, ssis]
excerpt_separator: <!--more-->
---

**Problem:** In SQL Server Integration Services (SSIS), you're trying to import
from a data dump from another database system that has different data types from
SQL Server. While the conversions look pretty straigh forward, you get failures
of the type "The value could not be converted because of a potential loss of
data.". But despite the mismatch data types, you can't see anything wrong.

<!--more-->

**Background:** In my case I am converting from a Paradox dump. Paradox has an
`integer` type whose length comes out to 11 digits, whereas SQL Server's `int`
type is 4 bytes (max 10 digits). However, inspecting the data, all of the
numbers I wanted to convert where less than 10 digits. But in spite of this I
get errors when implicitly converting (copying directly from my file source to
my OLE DB destination) or explicitly converting (using the Data Conversion or
Derived Column tasks).

**Solution:** Ignore the errors! I'm an OO programmer, not an SSIS guru, so I
can't say this is the ideal solution. But it works for me. I know &mdash;
without doubt &mdash; that my data will convert cleanly. So I converted my
fields with the Data Conversion task, and set the Error Output to "Ignore
failure" for both Errors and Truncation (not sufficient to just do Truncation).

<p class="center">{Image files no longer available}</p>
<!--
<div style="text-align: center;">
<img alt="data conversion transformation editor" src="http://www.safnet.com/writing/tech/data%20conversion%20transformation%20editor.jpg" width="400" height="391" />
<img alt="configure error output" src="http://www.safnet.com/writing/tech/configure%20error%20output.jpg" width="350" height="326" />
</div>
-->

## Comments

_imported from old Movable Type blog_

> author: chris\
> date: '2009-09-29 06:08:42 -0500'
>
> this is a bad solution as the error is not ignored, the entire row will be ignored! you will lose entire rows of data

---

> author: Stephen Fuqua\
> date: '2009-09-29 20:22:36 -0500'
>
> I appreciate the comment... however, that is not my experience. I just fired up
> SSIS and tested this out. As I expected, when I actually did have an error, that
> row was still output -- but with that particular value nulled. In my particular
> case, I know that the business rules indicate that this is not expected to ever
> occur; I don't advocate it for everyone.
>
> Furthermore, <a
> href="http://msdn.microsoft.com/en-us/library/ms141679.aspx">Microsoft's
> documentation</a> says of _Ignore failure_: "The error or the truncation is
> ignored and the data row is directed to the output of the transformation or
> source."
