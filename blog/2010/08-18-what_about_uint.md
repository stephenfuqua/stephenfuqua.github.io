---
title: What about uint?
date: '2010-08-18 20:38:01 -0500'
tags:
- tech
- dotnet
- programming

---

I'm writing a class with several methods that take integer input. The input
values cannot be less than zero. Since we're not on .Net 4.0 yet, I'm manually
writing code contracts (that is, my functions check preconditions), e.g. before
doing anything else, I write something like&hellip;

```csharp
if (sequenceNumber < 0)
{
    throw new ArgumentOutOfRangeException("sequenceNumber", "Sequence number must be 0 or greater");
}
```

This got me thinking: why don't we ever use unsigned integers? Seems like having
a uint would better communicate the requirement, and would simply not allow a
negative number.  The [main
answer](https://stackoverflow.com/questions/2013116/should-i-use-uint-in-c-for-values-that-cant-be-negative) seems to be that casting between uint and other data types, which is
inevitable, is ugly. And that uint is not CLS compliant. Even though I'm not
trying to write CLS-compliant code at the moment, I think I'll stick with int
&mdash; because that is our existing convention, and I don't see enough reason
to change the convention.

<!-- truncate -->
