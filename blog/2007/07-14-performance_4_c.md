---
title: 'Performance #4: Consolidate Object Creation from Database'
date: '2007-07-14 15:01:21 -0500'
slug: performance_4_c
tags: [tech, dotnet, performance]
---

_This article is part of the series [An Exercise in Performance Tuning in C#.Net](./06-25-an_exercise_in.md)_.

At this point I did not re-run the profiler but continued investigating memory allocation.
Here's an interesting looking result:

(removed link to missing image file)

<!-- truncate -->

Calls to `Class::FindByID` are accumulating up to 13.36% of the memory
allocation. And they are occurring in two different methods (`Class2::Prep`
and `Class3::reInitialize`) that are themselves called by the same method
(`Class3::runCalculations`). Surely I could eliminate one of these?

Turns out that these two calls are basically right next to each other in the code:

```csharp
reInitialize(obj1.ID);

if (!this.obj2.NoCalc)
{

        class2.Prep(ref obj1); `
```

Obvious strategy change: pass the `Class3` instance into `Prep()`
instead of having that function re-query for the correct `Class3` values.
I just had to add one line above this `Prep` call: `class2.Object2 =
obj2;`.

Well, this change one wasn't as dramatic as the last ones: only 2% improvement.
However, for some reason there was a great deal of variability in the 10 runs I
performed. If I throw out the largest number, which was larger than any times
from the version with un-tuned PinCalculation object, then that improvement is
2.6%.
