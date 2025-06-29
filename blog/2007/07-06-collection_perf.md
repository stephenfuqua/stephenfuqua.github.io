---
title: Collection Performance Comparisons
date: '2007-07-06 20:55:01 -0500'
tags: [tech, dotnet, performance]
---

This is _not_ part of my series on performance tuning a specific app.

## Problem

I have a [Registry](http://www.martinfowler.com/eaaCatalog/registry.html) class
in which I want to place a generic collection of objects. In this way I can add
new items to the registry on the fly (i.e. from a user application), without
having to recompile the library containing the the class. What is my best
option, in terms of performance, for a .Net 2.0 collection to hold my mixed-bag
of objects? I'll be referring to these with a string name.

<!-- truncate -->

## Solution

I was contemplating both a
[Hashtable](https://msdn2.microsoft.com/en-us/library/system.collections.hashtable(VS.80).aspx)
and a
[HybridDictionary](https://msdn2.microsoft.com/en-us/library/system.collections.specialized.listdictionary(vs.80).aspx).
Rather than testing the relative performance myself, I got lazy. And lucky, as
[Performance Quiz #4 -- Of Sets and
Sundry](https://learn.microsoft.com/en-us/archive/blogs/ricom/performance-quiz-4-of-sets-and-sundry)
is a great find. In my case I'm not expecting to have many objects in the
collection, but you never know. Therefore HybridDictionary is the way to go
(based on the linked analysis).

But the more I think about it, what I really want is a collection that takes a
string for the key (to avoid boxing) and a weakly-typed object as the value. Is
there a better option that I'm forgetting about? Perhaps I should try
implementing a [NameObjectCollectionBase](https://msdn2.microsoft.com/en-us/library/system.collections.specialized.nameobjectcollectionbase(vs.80).aspx),
leaving the object part as, well, an `object`. But that's not going to be
helpful either, because under the hood it would still be using a
`DictionaryEntry`, whose [constructor](https://msdn2.microsoft.com/en-us/library/system.collections.dictionaryentry.dictionaryentry(vs.80).aspx)
not surprisingly takes two `object`s.

So for now I'll go with the `HybridDictionary`. Perhaps I could write my own
collection class that would get the job done; maybe I could do some more
research and find that Microsoft has already provided the answer for me. But
that's just not worth the return on investment at this point.
