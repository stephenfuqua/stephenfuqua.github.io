---
layout: page
title: Unit Testing with Entity Framework Core and Async
date: 2019-12-27
comments: true
tags: [unit-test, dotnet, programming]
sharing: true
---

Entity Framework Core has a few changes that impact unit testing, particularly with respect to `EntityEntry.State` management. My previous unit testing techniques also did not take into account the use of `async` methods. In this article I'll present a few techniques used in the context of a POC exploration of IdentityServer4. Although .NET Core 3 is now fully available, these examples are based on .NET Core 2.2.

## Background

IdentityServer4 has a [`ConfigurationDbContext`](https://github.com/IdentityServer/IdentityServer4/blob/master/src/EntityFramework.Storage/src/DbContexts/ConfigurationDbContext.cs) that provides access for managing `Client` entities, along with an interface `IConfigurationDbContext`. While IdentityServer4's infrastructure handles all of the OAuth processing, CRUD operations for clients is left up to us. Therefore I created a `ClientsController` and a `ClientRepository`, and injected the interface into the repository. 

```csharp
public class ClientsController : ControllerBase
{
    public ClientsController(IClientRepository repo) { ... }
}

public class ClientRepository : IClientRepository
{
    public ClientRepository(IConfigurationDbContext context) { ... }
}

public class ConfigurationDbContext : DbContext, IConfigurationDbContext
{
    public DbSet<Client> Clients { get; set; }

}

namespace IdentityServer4.EntityFramework.Interfaces
{
  /// <summary>Abstraction for the configuration context.</summary>
  /// <seealso cref="T:System.IDisposable" />
  public interface IConfigurationDbContext : IDisposable
  {
    /// <summary>Gets or sets the clients.</summary>
    /// <value>The clients.</value>
    DbSet<Client> Clients { get; set; }
    /// <summary>Gets or sets the identity resources.</summary>
    /// <value>The identity resources.</value>
    DbSet<IdentityResource> IdentityResources { get; set; }
    /// <summary>Gets or sets the API resources.</summary>
    /// <value>The API resources.</value>
    DbSet<ApiResource> ApiResources { get; set; }
    /// <summary>Saves the changes.</summary>
    /// <returns></returns>
    int SaveChanges();
    /// <summary>Saves the changes.</summary>
    /// <returns></returns>
    Task<int> SaveChangesAsync();
  }
}
```

If I were hand-coding the `DbContext` class, I would have made sure to include an interface just as IdentityServer4 did. I would also decorate it with a `[ExcludeFromCodeCoverage]` attribute: data access logic, which needs unit testing, belongs in the repository. The `DbContext` class is pattern based and, although there may be mapping logic, it is impractical to unit test. We'll save that for full-blown API integration tests.

## Unit Testing Challenges
So now we have two classes to test: the controller and the repository. Let's focus on the repository. At first glance, it would seem trivial to write tests, and make them pass, using the `Clients` property and `SaveChangesAsync` method. The challenge comes from `DbSet`: it is an abstract class, it contains no implemented methods, the query logic requires an `IQueryable`, and the modification logic now returns `EntityEntry` objects. The `EntityEntry` object in turn is difficult to construct and the classes involved have warnings in the source code that they should not be directly relied on in non EntityFramework code. 

Also of note: EntityFrameworkCore now has an `Update` method to go along with `Add` and `Remove`, so that those of who do not like using EntityFramework change tracking (more on this below) no longer need to use `Attach` and manually set `EntityState.Modified`, subject of my [February blog post](2019-02-08-refactor-awayfrom-global-static).

In order to unit test this, we will need some kind of test double that gives us the equivalent functionality while minimizing the effort required to write the tests. After all, if the testing is hard, we're all the more likely to skip it.

## IAsyncEnumerable and IAsyncQueryProvider
For this purpose, it is easier to hand-create a set of test-only classes than to use a mocking framework. Because of the async calls on `IQueryable`, this turns out to be harder than first thought: Linq is being used, and it invokes behind-the-scenes logic on interfaces hidden deeply away from us. This finally reveals a deep truth about ORMs: true isolation in unit tests is impossible when you are relying on a tool to generate SQL statements for you. 

As I tried to work my own way through the additional difficulty of Linq with async support, I kept running up against an exception like this:

> "The source IQueryable doesn't implement IAsyncEnumerable{0}. Only sources that implement IAsyncEnumerable can be used for Entity Framework asynchronous operations."

Thankfully Microsoft provided a leg-up in [Testing with a mocking framework](https://docs.microsoft.com/en-us/ef/ef6/fundamentals/testing/mocking), albeit with Entity Framework 6 instead of Core involved. The code required for async has not changed much - primarily just a few interface name changes. My versions of these classes is [available in GitHub](https://github.com/stephenfuqua/safnet.libraries/tree/develop/TestHelper.AsyncDbSet): `FakeAsyncDbSet`, `FakeAsyncEnumerable`, and `FakeAsyncQueryProvider`.

## Writing Unit Tests

Now we have the pieces necessary to write good unit tests for a repository, following this formula:

1. Create a mock on the DbContext interface.
1. Create a `FakeAsyncDbSet<SomeClass>`.
1. Configure the mock to use this database set.
1. Instantiate the repository using the mock DbContext.
1. For query-based tests, manually add appropriate objects to the fake via `theFakeDbSet.List.Add(...)`. Write assertsions for the correctness of the query result.
1. For modification tests, verify that the correct objects were modified, using the fake's convenience properties (of type `List<SomeClass>`) `Added`, `Updated`, and `Deleted`.

For a fully worked example, using NUnit 3 and FakeItEasy, see [ClientRepositoryTests.cs](https://github.com/stephenfuqua/safnet.Identity.Api/blob/develop/test/Infrastructure/Persistence/ClientRepositoryTests.cs).

## Appendix: Change Tracking

Entity Framework's change tracking mechanism handles caching of data, helping prevent extra database calls. In some systems this might be useful. In a potentially load-balanced web server, caching needs to be in a shared system - not buried inside of Entity Framework. The code will have to be written with the assumption that the object is not yet cached by EF, so you might as well just turn off change tracking altogether. EF in itself performs much better this way, although theoretically at the expense of some extra data access work.

To completely disable change tracking, call the `UseQueryTrackingBehavior` method on the database options object:

```csharp
services.AddDbContext<ConfigurationDbContext>(options =>
{
    options.UseSqlServer(connectionString);
    options.UseQueryTrackingBehavior(QueryTrackingBehavior.NoTracking);
});
```