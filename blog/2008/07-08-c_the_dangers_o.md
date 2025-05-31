---
title: 'C#: The Dangers of Foreach'
date: '2008-07-08 18:55:11 -0500'
slug: c_the_dangers_o
tags:
- tech
- dotnet
- performance
---

Although very handy, C#'s `foreach` statement is actually quite dangerous. In
fact, I may swear off its use entirely. Why? Two reasons: (1) performance, and
(2) predictability.

<!-- truncate -->

## Performance

Iterating through a collection using `foreach` is slower than with `for`. I
can't remember where I first learned that, perhaps in [Patterns &amp;
Practices: Improving .Net Application Performance](https://msdn.microsoft.com/en-us/library/ms998547.aspx). Maybe it was from
personal experience. How much slower? Well, I suppose that depends on your
particular circumstances. Here are a few interesting references:

* [FOREACH Vs. FOR (C#)](https://www.codeproject.com/KB/cs/foreach.aspx): shows the extra IL code created for a `foreach` loop
* [To foreach or not to foreach that is the question](https://learn.microsoft.com/en-us/archive/blogs/kevin_ransom/to-foreach-or-not-to-foreach-that-is-the-question): claims it isn't so clear-cut, at least for regular arrays. Not absolutely conclusive.

## Predictability

I was looking at the C# Reference entry for [foreach](https://msdn.microsoft.com/en-us/library/ttw7t8t6(VS.80).aspx)
today and noticed this for the first time (italics added by me):

> The _foreach_ statement is used to iterate through the collection to get the
> desired information, but should not be used to change the contents of the
> collection to avoid `unpredictable side effects`.

What's that all about? Let's take this as an example:

```csharp
foreach(MyClass myObj in List<MyClass>)
```

Looking deeper into the [C# Language
Specification](https://msdn.microsoft.com/en-us/library/ms228593(VS.80).aspx)... the iteration variable is supposed to be read-only, though
apparently that doesn't stop you from updating a property of an object. Thus for
instance it would be illegal to assign a new value to `myObj`, but not to assign
a new value to `myObj.MyProperty`.

And that's all I can find. Why are there unpredictable side effects? I don't
know. But seems best to heed Microsoft's warning.

## Conclusion

Some argue that you shouldn't code for performance from the beginning, and
therefore go ahead and use `foreach` whenever you want so long as you don't
update the values. In my experience that's hogwash &mdash; most of the code I
work on goes into environments where performance is extremely important.
Besides, writing a for statement requires very little extra coding compared to a
`foreach` statement. Furthermore, if you have a lot going on inside your
iteration block, it can be easy to forget and accidentally update the iteration
variable inside a `foreach` loop. Thus do I conclude: just avoid `foreach`
altogether.

## Comments

Imported from old Movable Type blog:

> author: Abel Newland \
> date: '2009-02-11 12:29:51 -0600'
>
> You should read "C# 2008 and 2005 Threaded Programming: Beginner's Guide", by Gaston C. Hillar - `http://www.packtpub.com/beginners-guide-for-C-sharp-2008-and-2005-threaded-programming/book`
>
> Amazon: `http://www.amazon.com/2008-2005-Threaded-Programming-Beginners/dp/1847197108`
>
> The book is for beginners who want to exploit multi-core with C# 2005; 2008
> and future 2010. It includes many topics related to avoiding side-effects
> using object-oriented and funcional programming with C#.

---

> author: Jon Skeet \
> date: '2009-05-07 15:48:18 -0500'
>
> In my experience the performance difference between for and foreach is
> entirely insignificant unless you're doing _almost nothing_ in the loop.
>
> The readability improvement of using foreach _is_ significant, however.
>
> This sort of micro-optimization is _very_ easy to implement later on after
> profiling tells you that it's actually worthwhile - so my conclusion is
> definitely to use foreach wherever it's convenient, unless I have _evidence_
> that it's impacting performance significantly in that particular situation.
>
> As for the "unpredictability" side of things - I think you've misunderstood
> the point of the warning. The idea is that you shouldn't add or remove items
> from the collection over which you're iterating. Well-designed collections
> throw an exception if you try to (on the next step of the iteration) but it's
> easy to avoid in the first place. Changing the data within the object that the
> iteration variable refers to does no harm at all.
>
> Furthermore, I think you'll find LINQ is pretty hard to use without foreach :)
>
> Jon

---

> author: Stephen Fuqua \
> date: '2009-05-07 22:18:17 -0500'
>
> At this point I think you're definitely right in labeling this
> "micro-optimization". Should only worry about it when you know you have a
> performance issue and really need to squeeze out every last drop. The comment
> about changing data was really directed at junior developers with whom I work;
> I've seen them create this bug for themselves. I've definitely backed away
> from my strong statement about avoiding foreach. But I probably won't be using
> it for Linq anytime soon, since I prefer using stored procedures.
