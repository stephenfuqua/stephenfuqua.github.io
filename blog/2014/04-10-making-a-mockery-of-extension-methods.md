---
title: Making a Mockery of Extension Methods
date: 2014-04-10
tags: [programming, testing, dotnet]
---

Recently I have been looking at [ServiceStack's OrmLite](https://github.com/ServiceStack/ServiceStack.OrmLite) "Micro ORM" as a light-weight alternative to Entity Framework. It is relatively easy to use and very powerful, with capability for both code-first and database-first development. After learning the basic interaction, it was time to flip back into TDD-mode.

And then I found quite the challenge: I wanted to write unit tests that insure that I'm using OrmLite correctly. I was not interested (for the time being) in testing OrmLite's interaction with SQL Server itself. That is, I wanted behavioral unit tests rather than database integration tests.  Time for a [mock](https://martinfowler.com/articles/mocksArentStubs.html). But what would I mock? This ORM framework makes extensive use of [extension methods](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/extension-methods) that run off of the core `IDbConnection` interface from the .Net framework - so it would seem that there is no way to take advantage of [Dependency Injection](http://msdn.microsoft.com/en-us/magazine/cc163739.aspx).

<!--truncate-->

Enter the static delegates method promoted by Daniel Cazzulino (2025: article has disappeared). OK, so we have Constructor and Property Injection methods already. And now they are joined by have Delegate Injection. Let us take this simple example from a hypothetical [repository class](https://martinfowler.com/eaaCatalog/repository.html):

```csharp
var dbFactory = new OrmLiteConnectionFactory(connectionString, SqlServerDialect.Provider);
using (IDbConnection db = dbFactory.OpenDbConnection())
{
    using (var tran = db.OpenTransaction())
    {
        db.Save(new BusinessEntity());
        tran.Commit();
    }
}
```

Refactoring the class to use constructor dependency injection, inserting an `IDbConnectionFactory` instance instead, is trivial and allows us to write unit tests that have a mock version of `IDbConnectionFactory`. But  `OpenTransaction()` and `Save()` are all extension methods. How do we replace them?

Using Cazzulino's technique, we can create a static class containing static delegates, and then insert those delegates into the repository. When it comes time for unit testing, just replace those static delegates with inline delegates – thus, effectively mocking the methods. Here's the original signature for `OpenTransaction`:

```csharp
public static IDbTransaction OpenTransaction(this IDbConnection dbConn)
```

This can be represented with a [`Func<T, Tresult>`](https://learn.microsoft.com/en-us/dotnet/api/system.func-2?view=net-9.0&redirectedfrom=MSDN) delegate:

```csharp
public static Func<IDbConnection, IDbTransaction> OpenTransaction =
     (connection) => ReadConnectionExtensions.OpenTransaction(connection);
```

The `Save<T>()` method is a bit more troublesome, since it is itself a generic. In particular, I want to address this overload of Save():

```csharp
public static int Save<T>(this IDbConnection dbConn, params T[] objs)
```

The `<T>` threw me off – where do you declare it? You can't use put the `T` after `Save` in the `Func`. Then I realized it just needs to go on the static class. And what of `params T[]`? Convert it to an array of T:

```csharp
public static class DelegateFactory<T>`
{
   public static Func<IDbConnection, T[], int> Save =
   (connection, items) =>
   {
        return OrmLiteWriteConnectionExtensions.Save(connection, items);
   };
}
```

However, we don't really want the generic `T` applied to the non-generic methods, so perhaps we should create two different classes. And I just learned something new through trial and success… `<T>` allows for class name overloading!  Enough with the chatter. Here is a complete example with a happy-path test and one negative test that ensures the `Commit()` isn't called when there's an error.

```csharp
using Microsoft.VisualStudio.TestTools.UnitTesting;
using ServiceStack.Data;
using ServiceStack.OrmLite;
using System;
using System.Data;
using System.Linq;

namespace TestProject
{
    public class BusinessEntity { }

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

    [TestClass]
    public class UnitTest1
    {
        [TestMethod]
        public void SaveANewObjectWithProperTransactionManagement()
        {
            // Prepare input
            var input = new BusinessEntity();

            // Use moq where we can
            var mockRepository = new Moq.MockRepository(Moq.MockBehavior.Strict);

            var mockFactory = mockRepository.Create<IDbConnectionFactory>();
            var dbConnection = mockRepository.Create<IDbConnection>();
            mockFactory.Setup(x => x.OpenDbConnection())
                       .Returns(dbConnection.Object);
            dbConnection.Setup(x => x.Dispose());

            var mockTransaction = mockRepository.Create<IDbTransaction>();
            mockTransaction.Setup(x => x.Commit());
            mockTransaction.Setup(x => x.Dispose());

            // And use the delegate methods elsewhere
            var expectedReturnValue = 1;

            DelegateFactory.OpenTransaction = (connection) => { return mockTransaction.Object; };
            DelegateFactory<BusinessEntity>.Save = (connection, items) =>
            {
                Assert.AreSame(dbConnection.Object, connection, "wrong connection object used for Save");
                Assert.IsNotNull(items, "items array is null");
                Assert.AreEqual(1, items.Count(), "items array count");
                Assert.AreSame(input, items[0], "wrong item sent to the Save comand");

                return expectedReturnValue;
            };

            // Call the system under test
            var system = new Repository<BusinessEntity>(mockFactory.Object);
            var response = system.Save(input);

            // Evaluate the results
            Assert.AreEqual(expectedReturnValue, response);

            mockRepository.VerifyAll();
        }

        [TestMethod]
        public void CommitIsNeverCalledWhenSaveEncountersAnException()
        {
            // Prepare input
            var input = new BusinessEntity();

            // Use moq where we can
            var mockRepository = new Moq.MockRepository(Moq.MockBehavior.Strict);

            var mockFactory = mockRepository.Create<IDbConnectionFactory>();
            var dbConnection = mockRepository.Create<IDbConnection>();
            mockFactory.Setup(x => x.OpenDbConnection())
                       .Returns(dbConnection.Object);
            dbConnection.Setup(x => x.Dispose());

            var mockTransaction = mockRepository.Create<IDbTransaction>();

            // **** Commit isn't allow ****
            //mockTransaction.Setup(x => x.Commit());

            mockTransaction.Setup(x => x.Dispose());

            // And use the delegate methods elsewhere
            DelegateFactory.OpenTransaction = (connection) => { return mockTransaction.Object; };
            DelegateFactory<BusinessEntity>.Save = (connection, items) =>
            {
                Assert.AreSame(dbConnection.Object, connection, "wrong connection object used for Save");
                Assert.IsNotNull(items, "items array is null");
                Assert.AreEqual(1, items.Count(), "items array count");
                Assert.AreSame(input, items[0], "wrong item sent to the Save command");

                // **** Inject an exception ***
                // don't worry that this isn't a SQL exception - just make sure to
                // test that this same exception occurs when Save is called
                throw new InvalidCastException();
            };

            // Call the system under test
            var system = new Repository<BusinessEntity>(mockFactory.Object);
            try
            {
                system.Save(input);
            }
            catch (InvalidCastException)
            {
                // Evaluate the results
                mockRepository.VerifyAll();
            }
            catch (Exception ex)
            {
                Assert.Fail("wrong exception - caught " + ex.GetType().ToString());
            }
        }
    }
}
```
