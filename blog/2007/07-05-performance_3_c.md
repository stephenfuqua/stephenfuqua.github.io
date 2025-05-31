---
title: 'Performance #3: CLR Profiler'
date: '2007-07-05 19:59:15 -0500'
slug: performance_3_c
tags: [tech, dotnet, performance]

---

_This article is part of the series [An Exercise in Performance Tuning in C#.Net](./06-25-an_exercise_in.md)_.

Where else could I improve performance? I thought I should inspect the memory
usage and garbage collection. For that I found a great little tool from
Microsoft, the CLR Profiler, which I found through the MSDN Patterns &amp;
Practices series of guides on application performance and scalability. The
specific article that I found most helpful was [How To: Use CLR
Profiler](https://learn.microsoft.com/en-us/previous-versions/msp-n-p/ff650691(v=pandp.10)).

<!-- truncate -->

_Note: the above article was written for the .Net 1.1 version of the CLR Profiler.
It does not provide a link to the .Net 2.0 version, so that must be
downloaded separately. A few labels have changed between the versions._

I ran the application via the Profiler and began inspecting its results. The first
thing I looked at was the Allocation Graph, which shows memory allocations by function,
drilling down to the data types used.

(removed link to missing image file)

At the highest level, most of the performance comes from ProcessFile. That is not
surprising at this point, since the calculations are commented out. Zooming in on
ProcessFile, we find the following breakdown:

(removed link to missing image file)

And then drilling down once more into `processSingleLine`:

(removed link to missing image file)

Much to my surprise,  [Enum](https://msdn2.microsoft.com/en-us/library/sbbt4032(VS.80).aspx)::ToString
is the most intensive operation in `processSingleLine`. Now,
it is true that it is called dozens of times, and the 36.19% shown here is cumulative
for all the calls, so I wondered if (a) Enums are inefficient or (b) it was just
the shear number of calls.

Looking into (a), I could not find any instances where an Enum was being
explicitly converted to a string with ToString(). The Enums are being used as
indexes in a Dictionary object. Even though the Dictionary object is declared as
a generic
[`Dictionary<T,T>`](https://msdn2.microsoft.com/en-us/library/xfhwa508.aspx) with
the Enum as the key type, there must be an implicit conversion going on. Zooming
back out of this function, and zooming in on greater detail within the
functions, I was able to find that calls to Enum::GetValueField was taking 8.5%
of the total processing time (between all functions calling the Enums):

(remove link to a missing image file)

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
because of conversion ([boxing/unboxing](https://msdn2.microsoft.com/en-us/library/25z57t8s(vs.80).aspx))
issues, constant strings or integers are probably better in programs where
performance is critical.
