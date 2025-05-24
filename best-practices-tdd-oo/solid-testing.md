---
title: "SOLID and Unit Testing"
permalink: /best-practices-tdd-oo/solid-testing
date: 2020-01-12
tags: [testing, programming, oo]
---

S.O.L.I.D. (henceforth "SOLID") is a set of object-oriented design principals, assembled by Robert C. Martin and popularized in many of his articles and books. The following table is from his article [The Principles of OOD](http://butunclebob.com/ArticleS.UncleBob.PrinciplesOfOod):

{: .table .table-striped .table-bordered}
| Acronym | Principle | Summary |
| -- | -- | -- |
| SRP | The Single Responsibility Principle | A class should have one, and only one, reason to change. |
| OCP | The Open Closed Principle | You should be able to extend a class's behavior, without modifying it. |
| LSP | The Liskov Substitution Principle | Derived classes must be substitutable for their base classes. |
| ISP | The Interface Segregation Principle | Make fine grained interfaces that are client specific. |
| DIP | The Dependency Inversion Principle | Depend on abstractions, not on concretions. |

There are a myriad of good, detailed explanations [on the web](https://duckduckgo.com/?q=solid+object+oriented+design&ia=web). This article is about the relationship between SOLID and unit testing, and it will not make much of an attempt to explain the details of the various principles.

## Single Responsibility Principle (SRP)

Folks new to SRP often ask "does this mean a function should only have one line?" Answer: if that's all that is needed and useful to be coherent. The challenge with SRP is thus to define the boundary conditions: what is the "one thing" that the class or function is trying to accomplish? One way to judge SRP violations is by looking at the unit tests (or lack thereof). **The more complicated the unit tests, the more likely that SRP has been violated.**

How do you recover? Ideally you would have automated tests proving the code is working, before you try to make major changes to it. This advice may leave you with a chicken-and-egg feeling. See [legacy refactoring](legacy-refactoring) for some ideas.

Let's look at a simple example:

```csharp
public class PeopleRepository
{
    private readonly IDataAccess _dataAccess;

    public PeopleRepository(IDataAccess dataAccess)
    {
        _dataAccess = dataAccess ??
            throw new ArgumentNullException(nameof(dataAccess));
    }

    public PersonModel Save(PersonModel model)
    {
        var entity = new PersonEntity
        {
            FirstName = model.FirstName,
            LastName = modle.LastName
        };

        _dataAccess.People.Add(entity);
        _dataAccess.Save();

        model.Id = entity.Id;
        return model;
    }
}
```

Here we have a `Save` method that maps an API-oriented "model" object (DTO pattern) to a database-oriented "entity" object, and then saves the entity. The unit tests for this method need to assert the following:

1. The model's `FirstName` was mapped to the entity correctly.
1. The model's `LastName` was mapped to the entity correctly.
1. The resulting entity object is persisted to the data access layer correctly (in this case, that's two assertions: on the `Add` and `Save` methods).
1. The returned model is the original model, with the Id updated to reflect the auto-assigned Id that came back from the data access layer.

Now imagine if there were many more than two properties. Imagine if there were some complicated logic in the property mappings. The number of assertions and the number of different input objects to be tested would go up tremendously. Why not simplify by moving the mapping somewhere else? That is, let this repository do one thing: save an object. Let something else do the "other thing": mapping between different types. Which might be as simple as cutting the mapping lines and pasting them - _with no changes at this point_ - into a map function on one of the two classes.

Why no changes? Because you still need to write unit tests for that function, and you don't want to change the logic until the tests are there to support you. But the unit tests will be much simpler, since they are no longer mixed in with the data access code.

```csharp
public PersonModel Save(PersonModel model)
{
    var entity = model.ToEntity();

    _dataAccess.People.Add(entity);
    _dataAccess.Save();

    model.Id = entity.Id;
    return model;
}
```

Changes to the mapping logic no longer cause changes to this `Save` fuction: it satifies the Single Responsibility Principle.

## Open-Closed Principle (OCP)

"Closed to modification" does not mean the content of a method or class should not change, and therefore unit testing is irrelevant. It does mean that we should use inheritance wisely, and don't break interfaces. You can add to them, or create new interfaces. But avoid making breaking modifications. Once you have a good suite of unit tests, breaking the interface becomes _really obvious_ - because you'll have tests that no longer compile. Even more importantly though, a new variation in one class should not force changes in another class. For example, if a class contains conditional logic based on an enumeration or based on a type, then a modification to that enum or type should not trigger modification to the consuming class. The variation can be moved over to [Strategy](https://www.oodesign.com/strategy-pattern.html) classes that are injected into the system. Or the reverse: the system can be turned into an abstract class, with one or more abstract methods or properties. Concrete implementations would fill in the details for each variation. Both techniques are making good use of polymorphism.

Sometimes adding a dependency to a constructor - breaking the constructor interface - might feel absolutely necessary. If your unit test code is as clean as your "real code" then hopefully there won't be too many places to change. On the other hand, maybe that new dependency is pushing you into the territory of violating SRP.

Sticking closely to OCP also means that tests of a base class should never need modification when dealing with a sub-class's behavior.

## Liskov Substitution Principle (LSP)

This principle is not merely about the _interoperability_ of types that implement the same interface or inherit from the same base class. It is about _substitution_. If you a change in type forces a method to do something different, then an LSP violation is on hand.

The code below looks strange, and hopefully obviously bad in this context. However, it is not hard to imagine running into something like this in a legacy application. Perhaps `Initialize` did not initially exist. The world was good. Then someone discovered that the printer needed to do someting more. They wisely avoid bogging down the `Act` method with additional logic by creating a new method. But they added the method to the interface inappropriately and violated LSP.

```csharp
public interface IProcessor
{
    void Act();
    void Initialize();
}

public class PrintProcessor : IProcessor
{
    public void Act()
    {
        // Do something, but only if
        // Initialize() has been called
    }

    public void Initialize()
    {
        // Do something
    }
}

public EmailProcessor : IProcessor
{
    public void Act()
    {
        // Do something
    }

    public void Initialize()
    {
        throw new NotImplementedException();
    }
}

public ProcessManager
{
    public void StartProcess(IProcessor processor)
    {
        if (processor is PrintProcessor)
        {
            processor.Initialize();
        }

        processor.Act();
    }
}
```

If there were more logic in the `StartProcess` method it might be easy to overlook the problem. Unit tests would help catch this through the complexity required for testing. **Once again, difficulty in writing unit tests leads to realization that the code is not well-structured.**

The most obvious refactor in a case like this is to move the initialization code into the `PrintProcessor`'s constructor. Alternately, create a new IPrintProcessor interface that inherits from IProcessor; move `Initialize` to the new interface; see if it is appropriate to call `Initialize` from the class upstream of `ProcessManager`.

## Interface Segregation Principle (ISP)

From a testing perspective, creating small, well-constrained interfaces may make it moderately easier to create mocks and stubs. If nothing else, it constrains the options available for which method(s) or property(ies) should be mocked. An example of where I have used this principle: turning an Entity Framework DbContext into a data access layer. A typical Entity Framework DbContext might look like...

```csharp
public class HumanResourcesDbContext : DbContext
{
    public DbSet<Person> Persons { get; set;}

    public DbSet<Job> Jobs { get; set; }

    ...
}
```

Perhaps there is a simple CRUD-based API using this context. It contains separate controllers for the `/people` and `/jobs` resources. Each controller needs to reference this data access layer; a single interface could support both, but there is no reason (in this hypothetical example) for the `PeopleController` to be able to access the jobs. So create two _separate_ (or _segregated_) interfaces.

```csharp
public interface IPersonDataAccess
{
    PersonModel Create(PersonModel model);
    IReadOnlyList<PersonModel> Read();
    PersonModel Read(int id);
    PersonModel Update(PersonModel model);
    void Delete(int id);
    void Delete(PersonModel model);
}

public interface IJobDataAccess
{
    JobModel Create(JobModel model);
    IReadOnlyList<JobModel> Read();
    JobModel Read(int id);
    JobModel Update(JobModel model);
    void Delete(int id);
    void Delete(JobModel model);
}

public class HumanResourcesDbContext : DbContext, IPersonDataAccess, IJobDataAccess
{
    public DbSet<Person> Persons { get; set;}

    public DbSet<Job> Jobs { get; set; }

    ...

    PersonModel IPersonDataAccess.Create(PersonModel model)
    {
        ...
    }

    JobModel IJobDataAccess.Create(JobModel model)
    {
        ...
    }

    ... etc ..
}
```

In effect, this is turning the `HumanResourcesDbContext` into a set of Repositories. This avoids the need for writing repository classes that need to be unit tested, and it effectively hides the DbSet away. On the other hand, these functions are going to end up having logic. So they _should_ be tested. It would have been better to create separate repositories anyway. Plus, this is clearly an SRP violation.

So while the principle is sound and theoretically useful, in practice I've not seen it used often in clean code, highly testable code.

{: .mx-auto .w-75 .p-3 .mb-2 .bg-info .text-white }
For more on DbSet, see [Unit Testing with Entity Framework Core and Async](https://tech.safnet.com/archive/2019/12/27/testinging-with-ef-core/){: .text-dark }

## Dependency Inversion Principle (DIP)

This is the most important principle with respect to unit testing. Yes, even more than Single Responsibility. For if you can't isolate a class away from its dependencies, then you can't unit test it. All you can do is run integration testing.

There is also no test-driven development, in its true sense, without interfaces: having an interface allows you to begin testing a class against that interface, before you've created a concrete version of that interface.

Code smell: if you find yourself injecting more than one dependency into a class &ndash; and thus needing multiple mocks in your unit tests &ndash; then your class under development might be violating SRP. "Might be". There are perfectly legitimate design decisions that go this way. But the more classes/interfaces that are injected into a class, the worse off you are from a testing perspective. Your code coupling and cyclomatic complexity go up: fancy words for this will be harder to maintain and understand.

------------------------------

_[Back to the introduction / table of contents](./readme.md)_
