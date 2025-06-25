---
title: Automatic Properties in C# 3.0
date: '2009-04-02 22:39:43 -0500'
tags:
- tech
- dotnet
- programming

---

We just upgraded our servers to support .Net 3.x, so at last I'm able to start
migrating some of my code. I haven't taken a close look at all the features
available yet, but one that caught my eye and initially excited me is [automatic
properties](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/auto-implemented-properties). However, I had two conflicting reactions:

1. This is great, I don't have to create a private field and write getter/setter in a public Property anymore.
2. But then what's the point of not just creating a public field and using it directly?

Well, [this
article](https://industrial-inference.com/2007/01/29/c-automatic-properties-semantic-changes-to-help-cope-with-poor-syntax/) addresses a primary benefit: this facilitates refactoring. If, for
instance, we find later on that we need something more advanced than a simple
get or set statement, then we can add it without breaking the interface. I'm
sold.

<!-- truncate -->
