---
layout: page
title: "Legacy Refactoring Isolation Patterns"
permalink: /best-practices-tdd-oo/legacy-refactoring
date: 2020-01-13
comments: true
tags: [unit-test, programming, oo]
---

Any code that has been released is "legacy code." This article is about that really old legacy code your team inherited (from itself?). It wasn't designed in a way that is amenable to unit testing, and yet you're on a mission to add features, stamp out bugs, and improve the quality through refactoring. Here are some brief, practical tips for getting through this Gordian knot without a scimitar.

## Justification

![Lego wheel improvement](/images/lego-refactoring.jpg){: .center-image }

Before getting into the patterns, let's talk a bit more about refactoring. We've all heard the argument "I don't have time to refactor". Counter:

* How much time do you spend fixing bugs?
* How much time does it take to add a new feature?
* How much time is wasted trying to understand what the code is doing?
* How much time would it take to change frameworks?

If the answer is "very little", then the code is either already of very high quality&hellip; or it's dead. Otherwise, your team may need to make a little bit of time now to refactor, in order to move faster in the future. Like changing from square to round wheels.

Or if you're a car racing fan, think of it as a pit stop to change the tires and whatever else they do, so that the car will make it through to the end. And like a pit crew, the more you practice refactoring, the faster you'll be able to get the team back on the racetrack. So start practicing!

In order to refactor, you'll need to start isolating bits of code so that they can tested.

## Isolation Patterns

Find the right pattern, and slowly refactor to take advantage of it (or them, as the case may be). Keep this scientific principle in mind: hold everything constant, vary one thing, and measure the outcome. In software terms: make small changes, test frequently, or else you'll likely have an awfully hard time figuring out which variation caused the application to blow up. Martin Fowler [calls these changes](https://martinfowler.com/bliki/RefactoringMalapropism.html) "small behavior-preserving transformations."

Write unit tests as you go, as soon as possible, so that further refactoring will now be covered. And soon you'll find yourself able to fix bugs and add features using full [test-driven development](test-driven-development), instead of always having the test coverage lag behind.

Here's a handy flowchart to help think about test isolation (updated since [the original from 2014](archive/2014/08/06/unit-test-isolation-legacy/)):

![Test isolation flowchart](/images/unit-test-isolation-flowchart-2020.png){: .center-image .max-90 }

## Stubs and Mocks

Stubs and mocks are about faking out dependencies, allowing you to isolate the system under test. It is often said that [mocks aren't stubs](https://martinfowler.com/articles/mocksArentStubs.html). Yet in practice, how often does it matter?

Mocks are used for behavior verification after the system under test has run, whereas stubs more simply allow you to inject pre-defined input behavior into that system. Some mocking frameworks are very strict about this. And I used to be very strict about mocks and behavior: with MoQ, I would also use `MockBehavior.Strict` to ensure that no unexpected method calls were made on the mock. In a quickly evolving system, my teams found this resulted in brittle unit test code with little upside (that we could detect). So we stopped being so strict&hellip; and thousands of unit tests later I cannot think of a single time this decision has haunted me.

Last year, the team I support began getting rid of RhinoMocks, which has been dead for a long time. Before blindly jumping on the well-trodden path of MoQ, the team evaluated FakeItEasy. And liked it. So do I. It made for an easy transition from RhinoMocks, as it has some similar syntax. And it does away with the explicit distinction between mocks and stubs. Again, haven't seen a problem with that yet. (See [Unit Test Tools and Patterns](unit-test-tools-patterns) for more on these frameworks).

But you can only create a fake object (aka test double, aka either stub or mock, &hellip;) when you are [using interfaces](solid-testing).

Here's a trivial example to think about. `BadSystem` is not unit testable &ndash; because you cannot isolate the system from the `ConcreteA` and `ConcreteB` classes.

```csharp
using System.Collections.Generic;
using System.Linq;

namespace Practices_For_TDD_OO
{
    public enum Options
    {
        UpperCase,
        LowerCase
    }

    public class ConcreteA
    {
        private static readonly List<char> Alphabet = "abcdefghijklmnopqrstuvwxyz".ToList();

        public string ActOn(string input, Options option)
        {
            string output = string.Empty;

            foreach (var c in input.ToLower())
            {
                var newIndex = Alphabet.IndexOf(c) - 1;
                newIndex = (newIndex < 0 ? newIndex + 26 : newIndex);
                string newChar = new string(new[] { Alphabet[newIndex] });
                output += (option == Options.UpperCase ? newChar.ToUpper() : newChar);
            }

            return output;
        }
    }

    public class ConcreteB
    {
        public Options Option => Options.UpperCase;
    }

    public class BadSystem
    {
        public string Method(string input)
        {
            return new ConcreteA().ActOn(input, new ConcreteB().Option);
        }
    }
}
```

Refactor it by extracting a couple of interfaces:

```csharp
using System;

namespace mockAndStubExample
{

    public interface IDependencyA
    {
        string ActOn(string input, Options option);
    }

    public interface IDependencyB
    {
        Options Option { get; }
    }

    public class BetterSystem
    {
        private readonly IDependencyA _aDependency;
        private readonly IDependencyB _bDependency;

        public BetterSystem(IDependencyA a, IDependencyB b)
        {
            _aDependency = a ?? throw new ArgumentNullException(nameof(a));
            _bDependency = b ?? throw new ArgumentNullException(nameof(b));
        }

        public string Method(string input)
        {
            return _aDependency.ActOn(input, _bDependency.Option);
        }
    }
}
```

And now unit test it with the help of a hand-created mock (with behavior verification capability) and stub. See [Unit Test Tools and Patterns](unit-test-tools-patterns) for improved versions that use mock/fake tools and a more structured approach to test writing.

```csharp
using System;
using NUnit.Framework;

namespace mockAndStubExample
{
       [TestFixture]
    public class SystemTests
    {
        [Test]
        public void MethodTest()
        {
            const string input = "a";
            const string expectedOutput = "Z";
            const Options option = Options.UpperCase;

            var mockOfA = new MockA { ExpectedResult = expectedOutput };
            var stubOfB = new StubB();
            var systemUnderTest = new BetterSystem(mockOfA, stubOfB);

            var actual = systemUnderTest.Method(input);

            Assert.That(actual, Is.EqualTo(expectedOutput));
            Assert.That(mockOfA.WasCalled, Is.True);
            Assert.That(mockOfA.Arguments.actualInput, Is.EqualTo(input));
            Assert.That(mockOfA.Arguments.actualOption, Is.EqualTo(option));
        }

        private class MockA : IDependencyA
        {
            public string ExpectedResult { get; set; }
            public (string actualInput, Options actualOption) Arguments { get; set; }
            public bool WasCalled { get; set; }

            public string ActOn(string input, Options option)
            {
                Arguments = (input, option);
                WasCalled = true;
                return ExpectedResult;
            }
        }

        private class StubB : IDependencyB
        {
            public Options Option => Options.UpperCase;
        }
    }
}
```

## Wrapping Static Methods

Static methods are great. Sometimes. Really, almost never. Dapper, I love you, but why do you have so much static? In this example, `QueryFirstOrDefault` will do all kinds of work behind the scenes using that `IDbConnection`. Technically we could create a fake `IDbConnection`... but it would be painful. And in effect, we would be unit testing the internals of Dapper. In other words, our system under test is not isolated.

```csharp
using System;
using System.Data;
using Dapper;

namespace Practices_For_TDD_OO
{
    public class Person
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
    }

    public class BadRepository
    {
        private readonly IDbConnection _dbConnection;

        public BadRepository(IDbConnection dbConnection)
        {
            _dbConnection = dbConnection ?? throw new ArgumentNullException(nameof(dbConnection));
        }

        public Person GetPerson(int id)
        {
            return _dbConnection.QueryFirstOrDefault<Person>("select firstname, lastname from public.person where id = @id", new { id });
        }
    }
}
```

One option that keeps with the Dapper paradigm is to use [static delegate injection](/archive/2014/04/10/making-a-mockery-of-extension-methods/) to provide a fake method.

```csharp
using System;
using System.Data;
using Dapper;
using FakeItEasy;
using NUnit.Framework;

namespace Practices_For_TDD_OO
{
    public static class Orm<TEntity>
    {
        public static Func<IDbConnection, string, object, TEntity> QueryFirstOrDefault =
            (connection, statement, parameters) => connection.QueryFirstOrDefault<TEntity>(statement, parameters);
    }

    public class DelegateInjectedRepository
    {
        private readonly IDbConnection _dbConnection;

        public DelegateInjectedRepository(IDbConnection dbConnection)
        {
            _dbConnection = dbConnection ?? throw new ArgumentNullException(nameof(dbConnection));
        }

        public Person GetPerson(int id)
        {
            return Orm<Person>.QueryFirstOrDefault(_dbConnection, "select firstname, lastname from public.person where id = @id", new { id });
        }
    }

    [TestFixture]
    public class DelegateInjectedRepositoryTests
    {
        [Test]
        public void GetPerson()
        {
            var dbConnection = A.Fake<IDbConnection>();
            var expectedPerson = new Person();
            const int id = 23;

            var mockQueryDelegate = new Func<IDbConnection, string, object, Person>(
                (connection, statement, parameters) =>
                {
                    dynamic d = parameters;
                    var actualId = d.id ?? d.Id;

                    if (actualId == null || actualId != id)
                    {
                        return null as Person;
                    }

                    return expectedPerson;
                });
            Orm<Person>.QueryFirstOrDefault = mockQueryDelegate;

            var system = new DelegateInjectedRepository(dbConnection);

            var actual = system.GetPerson(id);

            Assert.That(actual, Is.SameAs(expectedPerson));
        }
    }
}
```

This looks really clever. For a few seconds. But it isn't.

1. This is very strange looking and will throw off many developers.
1. As will be seen below, it wasn't really any easier than creating a full-fledged class.
1. Mocking the static delegate was non-trivial.
1. If multiple tests set a mock delegate, and tests run in parallel, then you get nasty and unexpected results.

Time to Wrap that static up, using the [Adapter Pattern](https://en.wikipedia.org/wiki/Adapter_pattern). In this example, instead of delegate factory, we simply create a real class (with interface, naturally) that is almost like a Decorator - it just redirects to Dapper. The new `DapperWrapper` class was easier to write, is easier to think about, and is much safer to use than the `Orm<TEntity>` class above.

An aside: this contrived example, the repository class doesn't actually do anything. Whatever is calling the repository could have just used `IOrm` directly. In a real world example there would likely be additional logic, such mapping between database entity and domain model objects, and/or additional methods with logic.

```csharp
using System;
using System.Data;
using Dapper;
using FakeItEasy;
using NUnit.Framework;

namespace Practices_For_TDD_OO
{
    public class DapperWrapper : IOrm
    {
        private readonly IDbConnection _dbConnection;

        public DapperWrapper(IDbConnection dbConnection)
        {
            _dbConnection = dbConnection ?? throw new ArgumentNullException(nameof(dbConnection));
        }

        public TEntity FirstOrDefault<TEntity>(string statement, object parameters)
            where TEntity : class
        {
            return _dbConnection.QueryFirstOrDefault<TEntity>(statement, parameters);
        }
    }

    public class BestRepository
    {
        public const string SelectPersonById = "select firstname, lastname from public.person where id = @id";

        private readonly IOrm _orm;

        public BestRepository(IOrm orm)
        {
            _orm = orm ?? throw new ArgumentNullException(nameof(orm));
        }

        public Person GetPerson(int id)
        {
            return _orm.FirstOrDefault<Person>(SelectPersonById, new { id });
        }
    }

    [TestFixture]
    public class BestRepositoryTests
    {
        [Test]
        public void GetPerson()
        {
            var expectedPerson = new Person();
            const int id = 23;

            var mockOrm = new MockOrm {Expected = expectedPerson};

            var systemUnderTest = new BestRepository(mockOrm);

            var actual = systemUnderTest.GetPerson(id);

            Assert.That(actual, Is.SameAs(expectedPerson));
            Assert.That(mockOrm.WasCalled, Is.True);
            Assert.That(mockOrm.Arguments.id, Is.EqualTo(id));
            Assert.That(mockOrm.Arguments.statement, Is.EqualTo(BestRepository.SelectPersonById));
        }

        private class MockOrm : IOrm
        {
            public object Expected { get; set; }
            public (string statement, int id) Arguments { get; set; }
            public bool WasCalled { get; set; }

            public TEntity FirstOrDefault<TEntity>(string statement, object parameters)
                where TEntity : class
            {
                WasCalled = true;

                dynamic d = parameters;
                var actualId = d.id ?? d.Id;

                Arguments = (statement, actualId);

                return Expected as TEntity;
            }
        }
    }
```

## Finding Seams

When Michael C. Feathers wrote about the Seam Model in _Working Effectively with Legacy Code_, I pictured unstitching the seams on a t-shirt, decomposing it into front, back, and two sleaves. I'm not sure if that's what he wanted me to think, but I do find the image helpful. How can I find the seams in the program - the places where it can come apart? Can I stitch a new sleave on?

His Seam Model is about isolating bits of code that are hard to test, moving them out of the main body of code under test. Ultimately it is an exercise in careful use of the Extract Method refactoring (Fowler), and then taking advantage of object orientation when building a test:

1. Move the hard-to-test element to a protected method.
1. The original code is _essentially unchanged_ if you're careful.
1. In the test project, create a test-specific subclass of the original sub-class.
1. Override the new method, replacing it with a fake implementation that will give known results.
1. Write your tests.

This approach could easily have been used to solve the static method call problems above. First, let us flesh out the example a little to make it more interesting.

```csharp
using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using Dapper;

namespace Practices_For_TDD_OO
{
    public class PersonDto
    {
        public int Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Title { get; set; }
        public string Name => $"{FirstName} {LastName}";

        public static PersonDto From(Person entity)
        {
            if (entity == null)
            {
                return null;
            }

            return new PersonDto
            {
                FirstName = entity.FirstName,
                LastName = entity.LastName,
                Id = entity.Id
            };
        }
    }

    public class Job
    {
        public string Title { get; set; }
        public int PersonId { get; set; }
    }

    public class BadRepository2
    {
        private readonly IDbConnection _dbConnection;

        public BadRepository2(IDbConnection dbConnection)
        {
            _dbConnection = dbConnection ?? throw new ArgumentNullException(nameof(dbConnection));
        }

        public PersonDto GetPerson(int id)
        {
            var entity = _dbConnection.QueryFirstOrDefault<Person>("select firstname, lastname from public.person where id = @id", new { id });
            var job = _dbConnection.QueryFirstOrDefault<Job>("select title from public.job where personid = @id", new { id });

            var dto = PersonDto.From(entity);
            dto.Title = job?.Title;

            return dto;
        }

        public IReadOnlyList<PersonDto> GetPerson(string lastName)
        {
            var entities = _dbConnection.Query<Person>("select firstname, lastname from public.person where lastname = @lastName", new { lastName });

            return entities.Select(PersonDto.From)
                .ToList();
        }
    }
}
```

The second method, which looks up a person by their last name, failed to get the person's job title. This was reported as bug that needs to be fixed. We want to unit test this while fixing the problem. The seams are the Dapper queries.

Before operating, perhaps things would be cleaner if all of the queries were using the same Dapper method. `QueryFirstOrDefault` is just a convenience method. It can easily be changed:

```csharp
var entity = _dbConnection.Query<Person>("select firstname, lastname from public.person where id = @id", new { id })
                        .FirstOrDefault();
```

Make that little change, then run the application to confirm that it was harmless. Now instead of creating an entire Adapter layer for Dapper, just extract `_dbConnection.Query` to a protected function:

```csharp
public class BadRepository2
{
    private readonly IDbConnection _dbConnection;

    public BadRepository2(IDbConnection dbConnection)
    {
        _dbConnection = dbConnection ?? throw new ArgumentNullException(nameof(dbConnection));
    }

    public PersonDto GetPerson(int id)
    {
        var entity = Get<Person>("select firstname, lastname from public.person where id = @id", new { id }).FirstOrDefault();
        var job = Get<Job>("select title from public.job where personid = @id", new { id }).FirstOrDefault();

        var dto = PersonDto.From(entity);
        dto.Title = job?.Title;

        return dto;
    }

    public IReadOnlyList<PersonDto> GetPerson(string lastName)
    {
        var entities = Get<Person>("select firstname, lastname from public.person where lastname = @lastName", new { lastName });

        return entities.Select(PersonDto.From)
            .ToList();
    }

    protected virtual IEnumerable<TEntity> Get<TEntity>(string command, object parameters)
    {
        return _dbConnection.Query<TEntity>(command, parameters);
    }
}
```

This is the same code as before, but with the problem statement moved out. Now we can work TDD style, following the green-red-green-refactor approach. First a test that passes (focused on the method that needs to change):

```csharp
[TestFixture]
public class BadRepository2Tests
{
    [Test]
    public void GetPersonByLastName()
    {
        var fakeDbConnection = A.Fake<IDbConnection>();
        var expectedPersonEntity = new Person {FirstName = "a", LastName = "b", Id = 2134};

        var systemUnderTest = new TestSpecificBadRepository(fakeDbConnection)
        {
            ExpectedPerson = expectedPersonEntity
        };

        var result = systemUnderTest.GetPerson(expectedPersonEntity.LastName);

        Assert.That(result, Is.Not.Null);
        Assert.That(result.Count, Is.EqualTo(1));

        var first = result.First();
        Assert.That(first.FirstName, Is.EqualTo(expectedPersonEntity.FirstName));
        Assert.That(first.LastName, Is.EqualTo(expectedPersonEntity.LastName));
        Assert.That(first.Id, Is.EqualTo(expectedPersonEntity.Id));
    }

    private class TestSpecificBadRepository : BadRepository2
    {
        public Person ExpectedPerson { get; set; }
        public Job ExpectedJob { get; set; }

        public TestSpecificBadRepository(IDbConnection dbConnection) : base(dbConnection) { }

        protected override IEnumerable<TEntity> Get<TEntity>(string command, object parameters)
        {
            if(typeof(TEntity) == typeof(Person))
            {
                return new TEntity[] { (TEntity) (ExpectedPerson as object) };
            }
            if (typeof(TEntity) == typeof(Job))
            {
                return new TEntity[] { (TEntity)(ExpectedJob as object) };
            }

            return Array.Empty<TEntity>();
        }
    }
}
```

This test passes. There is no explicit behavior verification on the mock `Get<TEntity>` method. The very fact that we got the expected response back already tells us that the method was called. But, we don't know that it was called correctly. For that, we would need to add some behavior verification capability into the `Get<TEntity>` method as we did elsewhere.

To turn this into a test that fails, just add a fake Job and an assertion.

```csharp
    [Test]
    public void GetPersonByLastName()
    {
        var fakeDbConnection = A.Fake<IDbConnection>();
        var expectedPersonEntity = new Person {FirstName = "a", LastName = "b", Id = 2134};
        var jobEntity = new Job {Title = "title"};

        var systemUnderTest = new TestSpecificBadRepository(fakeDbConnection)
        {
            ExpectedPerson = expectedPersonEntity,
            ExpectedJob =  jobEntity
        };

        var result = systemUnderTest.GetPerson(expectedPersonEntity.LastName);

        Assert.That(result, Is.Not.Null);
        Assert.That(result.Count, Is.EqualTo(1));

        var first = result.First();
        Assert.That(first.FirstName, Is.EqualTo(expectedPersonEntity.FirstName));
        Assert.That(first.LastName, Is.EqualTo(expectedPersonEntity.LastName));
        Assert.That(first.Id, Is.EqualTo(expectedPersonEntity.Id));

        Assert.That(first.Title, Is.EqualTo(jobEntity.Title));
    }
```

Ultimately this was a little easier than creating an entire Adapter to wrap up the Dapper methods. But not re-usable outside of the current class. So in a crunch, pulling at the seams helped isolate the code that needed testing - but didn't give the best long-term solution.

## Sprouting

Where a Seam pulled untestable code out of the main code body, a Sprout does the opposite: extracts testable code into a separate method. This is also a Michael C. Feathers technique. Here is a class that relies on `System.IO` classes in several ways, making it difficult to unit test:

```csharp
using System.IO;
using System.Text;

namespace Practices_For_TDD_OO
{
    public class FileSystemReporter
    {
        public string BuildFileReport(string path)
        {
            _ = path ?? throw new ArgumentNullException(nameof(path));

            if (!Directory.Exists(path))
            {
                throw new ArgumentException($"Path '{path} does not exist or is not a directory");
            }

            var builder = new StringBuilder();
            builder.AppendLine($"Report for directory {path}");
            builder.AppendLine(string.Empty);
            builder.AppendLine("File Name\tFile Size");

            var fileInfos = new DirectoryInfo(path).EnumerateFiles();

            foreach (var file in fileInfos)
            {
                builder.AppendLine($"{file.Name}\t{file.Length}");
            }

            return builder.ToString();
        }
    }
}
```

New requirement: change the report so that its output will be like

```none
Filesystem report for directory `xyz`

File Name    File Size
------------ -----------
file 1       12345
file 2       23456
```

Thus, the StringBuilder calls need to be modified. There are two separate sets of StringBuilder calls that need to modify, so let's extract (Sprout) two methods. The methods need to be accessible to a unit test, but they should not be advertised as `public`. Therefore they will be `protected`. Note that the lines of code are essentially the same before &ndash; just moved to a different location, and with a small change in that the new `AppendReportLine` method's formatting string references two strings instead of properties on an object. Good time to run the application and manually double-check that the output is still as expected.

```csharp
public class FileSystemReporter
{
    public string BuildFileReport(string path)
    {
        _ = path ?? throw new ArgumentNullException(nameof(path));

        if (!Directory.Exists(path))
        {
            throw new ArgumentException($"Path '{path} does not exist or is not a directory");
        }

        var builder = CreateReportHeader(path);

        var fileInfos = new DirectoryInfo(path).EnumerateFiles();

        foreach (var file in fileInfos)
        {
            builder = AppendReportLine(builder, file.Name, file.Length);
        }

        return builder.ToString();
    }

    protected static StringBuilder CreateReportHeader(string path)
    {
        var builder = new StringBuilder();
        builder.AppendLine($"Report for directory {path}");
        builder.AppendLine(string.Empty);
        builder.AppendLine("File Name\tFile Size");
        return builder;
    }

    protected static StringBuilder AppendReportLine(StringBuilder builder, string fileName, int fileLength)
    {
        builder.AppendLine($"{fileName}\t{fileLength}");
        return StringBuilder
    }
}
```

{: .bg-info }
Aside: since `StringBuilder` is a reference type, there was no requirement that the second method return the object. So why do so? Principle of "no suprises", discussed by Martin in _Clean Code_. In the main method it is very clear that second method is not just using the argument, but in fact modifying its state.

Now we can write effective unit tests for those two new functions using a test-specific subclass. Here are a pair of tests that are passing withe "legacy" code, which can now be modified following the red-green-refactor methdology.

```csharp
[TestFixture]
public class FileSystemReporterTest
{
    public class TestSpecificFileSystemReporter: FileSystemReporter_2
    {
        public new static StringBuilder CreateReportHeader(string path)
        {
            return FileSystemReporter_2.CreateReportHeader(path);
        }

        public new static StringBuilder AppendReportLine(StringBuilder builder, string fileName, long fileLength)
        {
            return FileSystemReporter_2.AppendReportLine(builder, fileName, fileLength);
        }
    }

    [Test]
    public void CreateReportHeader()
    {
        const string path = "c:\\some\\where";
        const string expected = @"Report for directory c:\some\where

File Name	File Size
";

        var actual = TestSpecificFileSystemReporter.CreateReportHeader(path);

        Assert.That(actual.ToString(), Is.EqualTo(expected));
    }

    [Test]
    public void AppendReportLine()
    {
        const string fileName = "file.txt";
        const long fileLength = 234;
        const string expected = @"file.txt	234
";

        var builder = new StringBuilder();
        var actual = TestSpecificFileSystemReporter.AppendReportLine(builder, fileName, fileLength);

        Assert.That(actual.ToString(), Is.EqualTo(expected));
    }
}
```

------------------------------

_[Back to the introduction / table of contents](intro)_
