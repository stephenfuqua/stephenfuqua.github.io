---
layout: page
title: Do not trust the generic List!
date: '2007-09-28 13:43:11 -0500'
basename: do_not_trust_th
tags: [tech, dotnet]
excerpt_separator: <!-- truncate -->
---

Actually, that's a slightly misleading title. You should trust `List<T>`,
but you should also know its limitations. Here is one of the dangers of
launching into using new functionality without reading all of the documentation.
I've been having trouble because a client application produces thousands of
reports. These reports are supposed to be sorted in a particular manner. I've
been sorting and sorting in SQL, and going not paying enough attention to test
well. Results in production? Not sorted.

So naturally I started properly stepping through the application, inspecting
results from SQL and in code. What do I find? That SQL is returning the proper
sort order, but then the ordering is getting lost. Why is that?

<!-- truncate -->

`List<T>` is basically what I remember as a vector in C++: an expandable,
more flexible array. Its been a while since I wrote anything in C++, so I don't
remember if vectors (in the STL) behave this way, but it seems like a pretty
natural assumption that the generic `List` would behave like arrays, with a
First-In-First-Out (FIFO) type approach.

Better read the [documentation](http://msdn2.microsoft.com/en-us/library/6sh2ey19(vs.80).aspx)
carefully though: "The List is not guaranteed to be sorted. You must sort the
List before performing operations (such as BinarySearch) that require the List
to be sorted."

I was not a computer science major. I only took a few programming classes, so I
don't always have a strong intuitive sense for memory allocation and usage. But
now that I think about it, this makes perfect sense. `List<T>` is the
generic implementation of an `ArrayList`. And as we [know](http://msdn2.microsoft.com/en-us/library/system.collections.arraylist(VS.80).aspx),
`ArrayList` "Implements the IList interface using an array whose size is
dynamically increased as required."

Naturally we _did_ talk about how arrays are stored in memory in both my intro
Turbo Pascal and intro Java classes. So "dynamically" should have been a trigger
to me: dynamic allocation means that the allocated memory is not likely to be
continuous. Still, doesn't it make sense that the container in memory &mdash;
that _thing_ which holds the pointers to the memory blocks making up the "array"
&mdash; would keep the pointers sorted in the order in which you input them,
regardless of to whence they point? That sounds like a valid approach to me. But
probably not the most efficient for returning the results. Spooling all the
results back to the user (or cache) would take longer if returned FIFO than if
the collection of pointers were organized according to memory placement rather
than input sequence.

So what should I do? There should be two answers:

1. Sort the results before using them, using `List<T>`'s `Sort()` method, or
1. find another generic that stores its info in a queue instead.

A quick search through the
[System.Collections.Generic](http://msdn2.microsoft.com/en-us/library/system.collections.generic.aspx)
namespace reveals that there is indeed a generic
[Queue&lt;T&gt;](http://msdn2.microsoft.com/en-us/library/7977ey2c.aspx), which
"Represents a first-in, first-out collection of objects." So there you go: if
you care about the order in which you added the entries into your collection,
then use a `Queue` instead of a `List`.
