---
title: Unit vs. Integration Tests When Querying Nullable Columns
date: '2012-04-12 20:47:11 -0500'
tags:
- tech
- programming
- dotnet
- testing

---

Here&rsquo;s an interesting scenario: I have a Linq-to-Entities query that is
giving me no results when performing a system test, but when I look in the
database, logically there should be results. Better yet, the unit test passes.
How can that be?

<!-- truncate -->

The query includes a step where it is excluding any MyObject that is linked a
particular SomeOtherObject. MyObject has a _conceptual_, but not _foreign_, key
that links to SomeOtherObject (call it "SomeGUID"). In this scenario, a `null`
is meaningful &mdash; it is a 1 to 0 relationship. That turns out to be the root
cause of the problem above.

I was just telling someone a few days ago that a query on a nullable column must
take the null into account, which surprised that person. And now I find that
I've overlooked that myself! Two problems then:

1. A _T-SQL WHERE_ clause like `SomeGUID !=
'SomeValue'` will not return a row where SomeGUID
is `NULL`. You need `SomeGUID !=
'SomeValue' OR SomeGUID IS NULL`. But a similar
_Linq WHERE_ clause that doesn&rsquo;t hit a database will
return the null row.
1. Unit tests of Linq-to-Entities, that use a fake database, may
not expose some problems with searches that encounter NULL values.
Integration tests are needed for that. Hence, don't forget to also
throw together at least a few integration tests for your
queries.

To prove this, I wrote a new unit test that uses the fake
database (there are other tests for this method, but I wanted to
focus on this particular problem by creating a new one). There is
one MyObject and it is not connected to any SomeOtherObject. The
query in question should return this one MyObject. The unit test
does indeed pass.

I then slightly rewrite the test so that the query is hitting
the real database, but with the same data: an integration test. The
test fails &mdash; no results are returned. At this point I was
expecting this.

Modify the Linq query so that it include the `OR ...
IS NULL` clause. From

```csharp
query = query.Where(x => x.SomeGUID != theGuidIDontWant);
```

To

```csharp
query = query.Where(x => x.SomeGUID != theGuidIDontWant || x.SomeGUID == null);
```

Now both tests are passing.
