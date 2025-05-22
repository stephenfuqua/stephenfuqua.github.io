---
title: Nice technique for modifying a subset of a List<T>
date: '2009-03-04 16:27:00 -0600'
slug: nice_technique
tags:
- tech
- programming
- dotnet
excerpt_separator: <!-- truncate -->
---

One of my team members sent in the following piece of code, which is clearly
intended to update the `OrderNumber` field for all objects in a
[`List<T>`](http://msdn.microsoft.com/en-us/library/6sh2ey19.aspx) of
objects that match a particular `productId`. I took one look at it and thought
"you can't do that!". But then I let the automated test run to see what
happens... lo and behold, it worked. And well it should, once I thought about
it.

<!-- truncate -->

```csharp
list = cardQueue.FindAll(delegate(MyObject obj1)
{
    if (obj1.ProductId == processedProductId)
    {
        obj1.OrderNumber = orderNumber;
    }

    return true;
});
```

It had never occurred to me that you can modify an object inside of a [`Predicate<T>`](https://msdn.microsoft.com/en-us/library/bfcke1bz.aspx)
method. But now that I look at it, why not? After all, in C#, objects are passed
around by
reference*, not value &mdash; when the method tests `obj1` to see if its
ProductId value is the one we are searching for, then that is the "real" object,
not just a copy. Thus the real object can be modified.

_* Postscript 2025: the old link explaining this is no dead. My statement is
confusing: "In C#, parameters to methods are passed by value..."
([source](https://learn.microsoft.com/en-us/dotnet/csharp/advanced-topics/performance/)).
However, the same page also says "...the value is a reference to a block of
memory that stores an instance of the type." So yes, it passes a value, but the value is itself a reference. Therefore the original object is mutable._
