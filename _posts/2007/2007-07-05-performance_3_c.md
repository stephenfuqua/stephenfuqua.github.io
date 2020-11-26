---
layout: post
title: 'Performance #3: CLR Profiler'
date: '2007-07-05 19:59:15 -0500'
basename: performance_3_c
tags: [tech, dotnet]
excerpt_separator: <!--more-->
---


_This article is part of the series <a href="/archive/2007/06/an_exercise_in">
An Exercise in Performance Tuning in C#.Net</a>_.

Where else could I improve performance? I thought I should inspect the memory usage
and garbage collection. For that I found a great little tool from Microsoft, the
CLR Profiler, which I found through the MSDN Patterns &amp; Practices series of guides
on application performance and scalability. The specific article that I found most
helpful was <a href="http://msdn2.microsoft.com/en-us/library/ms979205.aspx">How To:
Use CLR Profiler</a>.

<!--more-->

_Note: the above article was written for the .Net 1.1 version of the CLR Profiler.
It does not provide a link to the .Net 2.0 version, so that must be
<a href="http://www.microsoft.com/downloads/details.aspx?FamilyId=A362781C-3870-43BE-8926-862B40AA0CD0&amp;displaylang=en">downloaded separately</a>. A few labels have changed between the versions._

I ran the application via the Profiler and began inspecting its results. The first
thing I looked at was the Allocation Graph, which shows memory allocations by function,
drilling down to the data types used.

<p class="center">{Image file no longer available}</p>
<!--
<a href="http://www.safnet.com/writing/tech/archive/clr1.jpg" target="_blank">
<img src="http://www.safnet.com/writing/tech/archive/clr1_sm.jpg" width="600" height="133"
    border="1" alt="CLR 1" /></a>
-->

At the highest level, most of the performance comes from ProcessFile. That is not
surprising at this point, since the calculations are commented out. Zooming in on
ProcessFile, we find the following breakdown:

<p class="center">{Image file no longer available}</p>
<!--
<p style="text-align: center">
<img src="http://www.safnet.com/writing/tech/archive/clr2.jpg" width="418" height="337"
border="1" alt="CLR 2" />
-->

And then drilling down once more into `processSingleLine`:

<p class="center">{Image file no longer available}</p>
<!--
<p style="text-align: center">
<img src="http://www.safnet.com/writing/tech/archive/clr3.jpg" width="472" height="498"
border="1" alt="CLR 3" />
-->

Much to my surprise,  <a href="http://msdn2.microsoft.com/en-us/library/sbbt4032(VS.80).aspx">Enum</a>::ToString
is the most intensive operation in `processSingleLine`. Now,
it is true that it is called dozens of times, and the 36.19% shown here is cumulative
for all the calls, so I wondered if (a) Enums are inefficient or (b) it was just
the shear number of calls.

Looking into (a), I could not find any instances where an Enum was being explicitly
converted to a string with ToString(). The Enums are being used as indexes in a
Dictionary object. Even though the Dictionary object is declared as a generic <a
href="http://msdn2.microsoft.com/en-us/library/xfhwa508.aspx">Dictionary&lt;T,T&gt;</a>
with the Enum as the key type, there must be an implicit conversion going on. Zooming
back out of this function, and zooming in on greater detail within the functions,
I was able to find that calls to Enum::GetValueField was taking 8.5% of the total
processing time (between all functions calling the Enums):

<p class="center">{Image file no longer available}</p>
<!--
<p style="text-align: center">
<img src="/archive/images/clr4.jpg" width="164" height="98"
border="1" alt="CLR 4" />
-->

At least I think that's how to interpret it. Therefore as a next step in tuning
the processing, I decided to try replacing the main Enums with classes of constant
(static) strings ' no conversion required, they're strings from the beginning
now. For instance, I replaced:

```csharp
public enum DetailsFields
    {
         Field1,
         Field2,
    …
```

with this:

```csharp
public class aDetailsFields
    {
         public const string FIELD_1 = "Field1";
         public const string FIELD_2 = "Field2";
    …
```

When I re-ran my timing test under all other equal conditions, I found an **11%
improvement** in performance. Conclusion: Enums are great in many ways, but
because of conversion (<a
href="http://msdn2.microsoft.com/en-us/library/25z57t8s(vs.80).aspx">boxing/unboxing</a>)
issues, constant strings or integers are probably better in programs where
performance is critical.
