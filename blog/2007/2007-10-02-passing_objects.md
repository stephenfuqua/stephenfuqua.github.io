---
layout: page
title: Passing Objects Does Not Require 'ref'
date: '2007-10-02 16:05:21 -0500'
basename: passing_objects
tags: [tech, dotnet]
excerpt_separator: <!-- truncate -->
---

I'm willing to admit that I made a mistake, and I share this now for your
reference (no pun intended): in C#, your basic data types (int, string, short,
bool) are value-types. If you want to pass them to a method and have the
original value updated, instead of a copy, then you [must
pass](http://msdn2.microsoft.com/en-us/library/0f66670z(VS.80).aspx) them with the `ref` or `out` keywords. But not so with reference-types
(hence the name!), which includes classes.

One gray area: what to do [with
structs](http://msdn2.microsoft.com/en-us/library/8b0bdca4(VS.80).aspx). That last link says: "when a struct is passed to a method, a copy
of the struct is passed, but when a class instance is passed, a reference is
passed." So there you have it. Definitely pays to know the differences between
C# and C++!
