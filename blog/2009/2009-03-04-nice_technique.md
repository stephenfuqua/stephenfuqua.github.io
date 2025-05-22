---
layout: page
title: Nice technique for modifying a subset of a List<T>
date: '2009-03-04 16:27:00 -0600'
basename: nice_technique
tags:
- tech
- programming
- dotnet
excerpt_separator: <!-- truncate -->
---

One of my team members sent in the following piece of code, which is clearly
intended to update the `OrderNumber` field for all objects in a
<a href="http://msdn.microsoft.com/en-us/library/6sh2ey19.aspx">List<T></a> of
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

It had never occurred to me that you can modify an object inside of a <a
href="http://msdn.microsoft.com/en-us/library/bfcke1bz.aspx">Predicate<T></a>
method. But now that I look at it, why not? After all, in C#, objects are passed
around <a href="http://msdn.microsoft.com/en-us/library/0f66670z(VS.71).aspx">by
reference</a>, not value &mdash; when the method tests obj1 to see if its
ProductId value is the one we are searching for, then that is the "real" object,
not just a copy. Thus the real object can be modified.
