---
layout: post
title: 'Performance #7: An (unsafe) Dead End'
date: '2007-09-21 09:25:17 -0500'
basename: performance_7_f
categories:
- tech
- dotnet
excerpt_separator: <!--more-->
---

_This article is part of the series <a
href="/archives/2007/06/an_exercise_in">An Exercise in Performance Tuning in
C#.Net</a>_.

After a month-long hiatus &mdash; too much work, too fast and furious for
posting &mdash; I'm back to the last posts in the series on real-world
performance tuning. The point of these postings hasn't been to glorify my
ability to tune a C# data processing application, but rather to share what I've
learned in attempts to do so.

Where to next? Turns out my next steps were false starts, at least insofar as
_tuning_ is concerned. Still, there were some lessons (or should be) from these
dead ends.

<!--more-->

The application modifies a few pieces of data from the input file and writes out
a nearly-identical output file. I am re-reading the input file, identifying the
line to alter, stripping out the old values and inserting the new ones (note:
the modified data is an the `obj` object, which has preserved the original line
number for ease of going back to it at this stage):

```csharp
string str = this._fileLines[obj.LineNumber];
str = str.Remove(this._parseDictionary[Enums.Fields.Field1].Position - 1, this._parseDictionary[Enums.Fields.Field1].Length);
str = str.Insert(this._parseDictionary[Enums.Fields.Field1].Position - 1, obj.Field1.PadRight(this._parseDictionary[Enums.Fields.Field1].Length, ' '));
```

I thought this would end up copying data into 1 new string (`string str = ...`)
and then two more new strings for every change. So I changed the logic to use
(unsafe) pointers instead, making str into a pointer into the array: `char* strP
= &this._fileLines[obj.LineNumber].`

Much to my surprise this made no difference in the performance. I have to wonder
if I was misunderstanding string `str = this._fileLines[obj.LineNumber]`. I know
that if you have :

```csharp
string str1 = "something";
string str2 = str1;
```

then there will be two memory segments with the value "something". I thought
this statement would apply to my assignment `str =
this._fileLines[obj.LineNumber]`. But given that there was no performance
difference, I now suspect that assignment from the `List<string> [index]` is
treated implicitly as a pointer instead of a memory copy.
