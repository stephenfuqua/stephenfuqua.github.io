---
title: Think For One ... Second
date: '2009-06-20 07:58:06 -0500'
tags:
- tech
- dotnet
- programming

---

What's wrong with this code? There are unnecessary lines. So? Why care about
unnecessary lines? Because it shows that the programmer was not really thinking
about what he was doing.

```csharp
MyObject obj = someList.Find(delegate(MyObject test)
{
    if (test.Id.Equals(packageId))
    {
        return true;
    }
    else
    {
        return false;
    }
});
```

<!-- truncate -->

We always need to be thinking carefully about even little things like this, if
we want to produce quality code. Thankfully in the sense that I mean "thinking
carefully" it is something we can develop into habits, rather than having to
stop and consciously think carefully. One way to write this more simply:

```csharp
MyObject obj = someList.Find(delegate(MyObject test)
{
    return test.Id.Equals(packageId);
});
```
