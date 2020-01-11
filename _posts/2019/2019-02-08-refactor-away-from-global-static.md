---
layout: page
title: Refactor Away from Global Static
date: 2019-02-08
comments: true
tags: [unit-test, dotnet, programming]
sharing: true
---

In [Making a Mockery of Extension Methods](http://tech.safnet.com/archive/2014/04/10/making-a-mockery-of-extension-methods/) - way back in 2014 - I wrote about a technique for a code workaround that would facilitate replacing extension methods (global static methods) with mock objects for unit testing. Over the years I've used this technique a few times and found two major problems:

1. The technique of static delegate substitution is simply strange and requires too much thinking / analysis for good maintenance.
2. The unit tests are brittle, often failing on the first try due to multiple tests interacting with each other as they replace the static delegate.

Interestingly, I've found the second to be true with both XUnit and NUnit, even when supposedly running tests serially. This problem did not occur as frequently when I first started using the technique five years ago; I was using VS Tests or NUnit 2 back then, so perhaps the more recent brittleness is from the change in frameworks.

At last I grew tired of the technique and decided it would be better to simply replace it with something more familiar: an injectable class. Thus the recipe:

1. For a large set of extension methods over unmockable code - for example extension methods around database interaction - best to go ahead and create a thin adapter layer with an interface and constructor injection.
2. For a small static method over unmockable code, consider a small class with optional interface for either constructor or property injection.
3. If tempted to introduce a global static for any reason, consider instead using of these two techniques.

In my original article, I was wrapping extension methods from the micro ORM [OrmLite](https://github.com/ServiceStack/ServiceStack.OrmLite):

```csharp
public class Repository<T> where T: class
{
    private readonly IDbConnectionFactory dbFactory;

    public Repository(IDbConnectionFactory dbFactory)
    {
        if (dbFactory == null)
        {
            throw new ArgumentNullException("dbFactory");
        }

        this.dbFactory = dbFactory;
    }

    public int Save(T input)
    {
        int rowsAffected = 0;
        using (IDbConnection db = dbFactory.OpenDbConnection())
        {
            using (var tran = DelegateFactory.OpenTransaction(db))
            {
                rowsAffected = DelegateFactory<T>.Save(db, new[] { input });
                tran.Commit();
            }
        }
        return rowsAffected;
    }
}

public static class DelegateFactory
{
    public static Func<IDbConnection, IDbTransaction> OpenTransaction = (connection) => { return ReadConnectionExtensions.OpenTransaction(connection); };
}

public static class DelegateFactory<T>
{
    public static Func<IDbConnection, T[], int> Save = (connection, items) => { return OrmLiteWriteConnectionExtensions.Save(connection, items); };
}
```

The two delegate factories allowed `Repository` to be fully-testable, but at the expense of bringing in an indirection pattern that is unfamiliar to most developers and has the test-interaction problem mentioned earlier. Instead today I would simply follow the adapter pattern. Alternately I could accept that `Repository` is light enough to not be unit tested - that it is effectively, already, an adapter. The transaction support might be worth unit testing, and it is worth considering that a full-blown repository class would have more than just that single `Save` method. Improved version that is trival to unit test:

```csharp
public interface IDbPersistence : IDisposable {
    IDbConnection OpenConnection();
    IDbTransaction StartTransaction();
    int Save<T>(params T[] records);
    void Commit();
}

public class Repository<T> where T: class
{
    private readonly IDbPersistence _persistenceLayer;

    public Repository(IDbPersistence persistenceLayer)
    {
        _persistenceLayer = persistenceLayer ?? throw new ArgumentNullException(nameof(persistenceLayer));
    }

    public int Save(T input)
    {
        int rowsAffected = 0;
        using (var connection = _persistenceLayer.OpenConnection())
        {
            using (_ = _persistenceLayer.OpenTransaction())
            {
                rowsAffected = _persistenceLayer.Save(input);
                _persistenceLayer.Commit();
            }
        }
        return rowsAffected;
    }
}
```

As another example, in the [FlightNode](https://www.github.com/FlightNode) project I used Entity Framework (EF) with tracking turned off for higher performance. When tracking is disabled, EF must be told that an object has been modified if you wish for EF to build an `UPDATE` SQL statement. In FlightNode, I had a business / domain class called `DomainManager`, with an injected `IPersistenceBase`. This class is arguably very similar to what most people would call a repository. I considered it business logic because it performed input validation on domain objects. In the original version, this class contained a static delegate:

```csharp
public static Action<IPersistenceBase<TEntity>, TEntity> SetModifiedState = (IPersistenceBase<TEntity> persistenceLayer, TEntity input) => persistenceLayer.Entry(input).State = System.Data.Entity.EntityState.Modified;
```

The brittle unit tests were getting beyond annoying, so recently I finally changed this to wrap this single command in a utility class. To prevent breaking every unit test through introduction of a new constructor argument, I used property injection: thus only the unit tests that needed to mock this method would need to inject a replacement. I didn't even bother adding an interface, knowing that I could use `Mock` to replace this `virtual` method.

```csharp
public class EfStateModifier
{
    public virtual void SetModifiedState(IModifiable persistenceLayer, object input)
    {
        persistenceLayer.Entry(input).State = System.Data.Entity.EntityState.Modified;
    };

}
```

Usage:

```csharp
public abstract class DomainManagerBase<TEntity>

    private readonly IPersistenceBase<TEntity> _persistence;{
    private EfStateModifier _efStateModifier;

    public EfStateModifier StateModifier
    {
        get => _efStateModifier ?? (_efStateModifier = new EfStateModifier());
        set => _efStateModifier = value;
    }

    protected DomainManagerBase(IPersistenceBase<TEntity> persistence)
    {
        _persistence = persistence ?? throw new ArgumentNullException(nameof(persistence));
    }

    public virtual int Update(TEntity input)
    {
        // trust the validator to handle null values
        input.Validate();
        StateModifier.SetModifiedState(Persistence, input);

        return _persistence.SaveChanges();
    }
}
```

This fixed the brittle test problem nicely. However, it leaves in place a glaringly-obvious problem: this base class is tainted by presence of Entity Framework! The FlightNode project was an after hours project with no one to review the code, one that an external organization was dependent on. In hindsight I see that I got sloppy here in my haste to deliver the code on a seasonally-relevant roadmap. The `IPersistenceBase` should have hidden the state modification.
