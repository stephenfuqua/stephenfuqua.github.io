---
layout: page
title: Studying Source Code
date: '2015-01-29'
basename: studying_source_code
tags:
- tech
- programming
- dotnet
excerpt_separator: <!--more-->
---

I've been misunderstanding .NET's List<T> for years.

Two incidents this week have driven home the value of being able to study the
source code of frameworks I code with. One the one hand, I was using [NServiceKit.OrmLite](https://github.com/NServiceKit/NServiceKit.OrmLite)
for database access, and needed to understand how it constructs its SQL. Through
study of the code, I was able to find and remediate a limitation in the wildcard
handling*.

<!--more-->

And while working on that data access code, a coworker challenged my
understanding of the `List<T>` data structure. I thought that it did not
guarantee that elements would remain ordered in the manner in which they were
entered. With that in mind, I have been (ab)using the `Queue<T>` whenever I've
been concerned about retaining the original input order (for example, to store
query results when the query itself is ordered).

What drove me to that incorrect conclusion? Some years ago, I saw mysterious
behavior on data stored in a `List`. The data did not come out in the order I
expected, causing a visible bug. Reading in the [MSDN
documentation](https://msdn.microsoft.com/en-us/library/6sh2ey19%28v=vs.110%29.aspx), I found that:

> The List<T> is not guaranteed to be sorted. You must sort the List<T> before
> performing operations (such as BinarySearch) that require the List<T> to be
> sorted.

With the evidence in front of my eyes, I understood this to mean that the input
order was not guaranteed to stay that way. How could this be? I assumed there
was something about the way that `List` storage is expanded, which could
re-arrange the pointers arbitrarily &mdash; contributing to the high performance
of this data type.

Suddenly recalling that Microsoft has opened up parts of the .Net code as
"reference material", and feeling discomfited by this long-held assertion, I
sought out answers today. And what did I find? That the `[List](http://referencesource.microsoft.com/#mscorlib/system/collections/generic/list.cs)`
and the `[Queue](http://referencesource.microsoft.com/#mscorlib/system/collections/queue.cs)`
are both backed by arrays. And arrays do not spontaneously re-arrange
themselves.

So now I go back and ask why Microsoft decided to make this statement about
sorting. Clearly, they just mean that it is not, for instance, alpa-numerically
sorted. Well, who would have expected that anyway? My folly was in assuming that
this statement could not be as basic as it really is. Surely, I rationalized
years ago, it was referring to something fundamental about the type, not about
programmers being dumb. So I outsmarted myself. And thanks to the source code,
now I know better: use the `List` all the time. Unless you need a `Queue` so
that you are removing items from a collection as you access them (through
dequeuing/popping).

---

* I should submit a pull request to the maintainers. The powerful <a
  href="https://github.com/NServiceKit/NServiceKit.OrmLite/blob/master/src/NServiceKit.OrmLite/Expressions/ExpressionVisitor.cs">ExpressionVisitor</a>
  has an utterly unnecessary `upper` in its wildcard handling:

```csharp
case "StartsWith":
    statement = string.Format("upper({0}) like {1} ", quotedColName, OrmLiteConfig.DialectProvider.GetQuotedParam(args[0].ToString().ToUpper() + "%"));
break;
case "EndsWith":
     statement = string.Format("upper({0}) like {1}", quotedColName, OrmLiteConfig.DialectProvider.GetQuotedParam("%" + args[0].ToString().ToUpper()));
break;
case "Contains":
     statement = string.Format("upper({0}) like {1}", quotedColName, OrmLiteConfig.DialectProvider.GetQuotedParam("%" + args[0].ToString().ToUpper() + "%"));
break;
```

Those `upper` function calls will cause the SQL Server query optimizer to do a
table scan instead of an index scan. It should only be used if your database is
configured with a case-sensitive collation &mdash; whereas the default setting
is _case insensitive_. The use of `upper` should be configured through a
property on this class.

## Comments

_Comments imported from old blog_

> author: ravinder.trx<br>
> date: '2015-02-04 21:00:16 -0600'
>
> Stephen,
>
> I was also under the impression and I have also gone through articles from
> Microsoft.So I was using Queue instead of List<T> For keeping ordered items.
>
> Thanks for keeping this in notice.
>
> Happy Learning :)
>
> Ravinder Singh
