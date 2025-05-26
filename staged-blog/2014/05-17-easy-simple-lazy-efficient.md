---
title: "easy : simple :: lazy : efficient"
date: 2014-05-17
tags: [programming]
---

{: .float-right }
![Two bridges](/img/bridgesEasyComplex.png)

As a "team lead" software engineer, I feel that an important part of my role is to ensure that the code is simple, but not necessarily easy. In fact, when I hear a developer say that "using this approach is easier," I have to fight the urge to lower my tail and growl menacingly.

Granted: code that only a senior developer, or worse yet only the author, understands is likewise unacceptable. Show me a piece of code that is too complex and abstruse, and we can have a conversation about (a) object oriented design theory and patterns, (b) refactoring to more self-explanatory methods, and (c) adding some appropriate formatting, comments and/or external documentation for blocks of code that are still unnerving. After all, "_Everything should be made as simple as possible, but not simpler_," to (supposedly) quote Einstein – and frankly, general relativity is still hard to understand without significant study.

Easy applies to the use of software, perhaps. But in code, it leads to copy-paste duplication, which leads to proliferation of bugs, more time spent writing unit tests (you're going for high code coverage, right?), and logic that must be maintained in too many places. In code, it leads to large [if/switch statements](http://c2.com/cgi/wiki?SwitchStatementsSmell) in multiple places, instead of relying on polymorphism – which can be both duplicated code and a maintenance nightmare when you add new states. In code, it can lead to using the wrong construct: using a `List<T>` collection is the easy way, but how many times have I seen it misused in a situation where sort order is important?

Simple is the right concept, not easy. [Do the simplest thing that could possibly work](http://c2.com/cgi/wiki?DoTheSimplestThingThatCouldPossiblyWork) is a meaningful mantra. When easy aligns with effective and clean then you get simple. Put another way: easy is to simple as lazy is to efficient.

In Management 3.0, Jurgen Appelo gives us a great discussion [on the difference between complex and complicated](http://bit.ly/1sF8KHs) (the opposite of simple). He sums it up in the delightful chart below. Mixing messages, one might say that easy all too often leads to simple but chaotic.

<div class="text--center">
![Appelo complexity chart](https://farm6.static.flickr.com/5285/5201865670_273290a256.jpg)
</div>

(By the way, this is an excellent book and I recommend it highly, for anyone who wishes hone their leadership skills, whether in the software field or otherwise).

The key takeway might be this: go ahead and work to keep code (or teams, theories, etc) as simple as possible, but do not fear complexity in itself, if that keeps you from the edge of chaos. This, to me, is the essence of elegance.

_P.S. sometimes constraints push us into the "easy way", but let's at least be honest with ourselves when that happens._
