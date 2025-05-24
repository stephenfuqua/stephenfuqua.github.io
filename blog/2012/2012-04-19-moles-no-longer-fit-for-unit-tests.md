---
title: 'Moles: No Longer Fit for Unit Tests'
date: 2012-04-19
tags:
- tech
- programming
- dotnet
- testing
---

![No moles](/img/noMoles.png){: .float-right }

Moles is a powerful and useful framework for unit testing. Or was. But even
then, it was overused (at least by me). But no more!

The first clue that I might need to walk away from Moles was the recent
difficulty another developer was having in trying to get a unit test project
up-and-running on his computer. I had installed what was current in early 2011,
and he had installed the current version from last 2011. Turns out there was a
significant change – the config file no longer worked. We had to update the
assemblies correctly on my machine, rebuild many times, and fool around with
manually removing some assemblies. It got confusing and messy. I suppose that's
why MS still labeled this version as < 1.0.

Next: _Growing Object-Oriented Software, Guided by Tests_ showed me how I was
letting design guide tests far too much – and here I thought I was practicing
test driven development (TDD) just by writing unit tests. No. Moles was a
symptom of this – the framework is used to replace a concrete method in a
dependent class. Well, in good TDD, the dependent class shouldn't exist yet.
There should not be a concrete method to replace.

> "There's a more subtle but powerful reason for not mocking concrete classes.
> When we extract an interface as part of our test-driven development process,
> we have to think up a name to describe the relationship we've just discovered
> &ndash; in this example, the ScheduledDevice. We find that this makes us think
> harder about the domain and teases out concepts that we might otherwise miss.
> Once something has a name, we can talk about it." (from Ch 20, unknown page)

Next: Microsoft's own documentation tells me that I'm doing it wrong, and that I
would experience "significant performance degradation" from use of Moles. I
should have been doing more with Stubs. From the _Microsoft Moles Reference
Manual_ (v0.91, p4):

> "In general, we recommend that you use stub types to isolate from
> dependencies. This can be achieved by hiding the components behind interfaces.
> Mole types can be used to isolate from third-party components that do not
> provide a testable API."

Finally: Microsoft [has
announced](https://www.microsoft.com/en-us/research/project/moles-isolation-framework-for-net/?from=http%3A%2F%2Fresearch.microsoft.com%2Fen-us%2Fprojects%2Fmoles%2F)
the end-of-the-line for Moles. In Visual Studio, the framework [will be
replaced](http://www.peterprovost.org/blog/2012/04/15/visual-studio-11-fakes-part-1/)
with one called Fakes.
