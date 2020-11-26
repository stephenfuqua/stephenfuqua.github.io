---
layout: page
title: String.IsNullOrEmpty - performance considerations, bugs
date: '2008-11-20 10:00:03 -0600'
basename: stringisnullore
tags:
- tech
- dotnet
excerpt_separator: <!--more-->
---

I once read that .Net's <a
href="http://msdn.microsoft.com/en-us/library/system.string.isnullorempty(VS.80).aspx">String.IsNullOrEmpty</a>
performs better, and is safer, than just checking to see if a particular string
has an empty value. I.e. replace `if (myString == "")` or `if
(myString.Equals(string.Empty))` or `if (myString.Length == 0)` with `if
(String.IsNullOrEmpty(myString))`. It is certainly easy to read, and points out
that the string should really be checked for `null` value before doing anything
else.

<!--more-->

Wanting to double-check my memory before recommending this method to a
colleague, I found a few very interesting blog posts that suggest to me that I
should avoid its usage:

<ol>
<li><a href="http://msmvps.com/blogs/bill/archive/2006/04/04/89234.aspx">DANGER ! String.IsNullOrEmpty can lead to runtime Null exceptions !!</a>, it looks like this isn't fully explained yet. Might not be an issue in .Net 3.0/3.5 frameworks, but I'm still using .Net 2.0, so it is best to heed this warning.</li>
<li><a href="http://dotnetperls.com/Content/IsNullOrEmpty-Samples.aspx">string.IsNullOrEmpty Samples</a>, it seems the performance is good, but not the best. So where performance matters, go with the longest, safest version: `if (myString == null || myString.Length == 0)`</li>
</ol>

## Comments

_imported from old Movable Type blog_

> author: Rob\
> date: '2009-03-10 06:39:07 -0500'
>
> As well as not being an issue for .Net 3/3.5 as you suggest, it was also fixed
> a while ago, for .NET 2. It was fixed by a hotfix dated September 3, 2007
> [http://support.microsoft.com/kb/940900/] and included in SP1
> [http://support.microsoft.com/kb/945757].
>
> So while the second issue may affect some people (as you say, where
> performance matters, and where it matters over readability), the first is no
> longer something to worry about (or has been for a while)
