---
layout: post
title: Collection Performance Comparisons
date: '2007-07-06 20:55:01 -0500'
basename: collection_perf
categories:
- tech
- dotnet
excerpt_separator: <!--more-->
---

This is _not_ part of my series on performance tuning a specific app.

**Problem:** I have a <a
href="http://www.martinfowler.com/eaaCatalog/registry.html">Registry</a> class
in which I want to place a generic collection of objects. In this way I can add
new items to the registry on the fly (i.e. from a user application), without
having to recompile the library containing the the class. What is my best
option, in terms of performance, for a .Net 2.0 collection to hold my mixed-bag
of objects? I'll be referring to these with a string name.

<!--more-->

**Solution:**  I was contemplating both a <a
href="http://msdn2.microsoft.com/en-us/library/system.collections.hashtable(VS.80).aspx">Hashtable
</a> and a <a
href="http://msdn2.microsoft.com/en-us/library/system.collections.specialized.listdictionary(vs.80).aspx">HybridDictionary</a>.
Rather than testing the relative performance myself, I got lazy. And lucky, as
<a
href="http://blogs.msdn.com/ricom/archive/2004/08/18/performance-quiz-4-of-sets-and-sundry.aspx">Performance
Quiz #4 -- Of Sets and Sundry</a> is a great find. In my case I'm not expecting
to have many objects in the collection, but you never know. Therefore
HybridDictionary is the way to go (based on the linked analysis).

But the more I think about it, what I really want is a collection that takes a
string for the key (to avoid boxing) and a weakly-typed object as the value. Is
there a better option that I'm forgetting about? Perhaps I should try
implementing a <a
href="http://msdn2.microsoft.com/en-us/library/system.collections.specialized.nameobjectcollectionbase(vs.80).aspx">NameObjectCollectionBase</a>,
leaving the object part as, well, an `object`. But that's not going to be
helpful either, because under the hood it would still be using a
`DictionaryEntry`, whose <a
href="http://msdn2.microsoft.com/en-us/library/system.collections.dictionaryentry.dictionaryentry(vs.80).aspx">constructor</a>
not surprisingly takes two `object`s.

So for now I'll go with the `HybridDictionary`. Perhaps I could write my own
collection class that would get the job done; maybe I could do some more
research and find that Microsoft has already provided the answer for me. But
that's just not worth the return on investment at this point.
