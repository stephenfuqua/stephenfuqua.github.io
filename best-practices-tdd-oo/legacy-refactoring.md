---
layout: page
title: "Legacy Refactoring Isolation Patterns: Best Practices in Test-Driven, Object Oriented, Green- and Brownfield Development"
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

## Static Methods

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

## Sprouting and Adapting

Here is a simple class and method for creating a "report" of all the files and their sizes in a diretory path.

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

A new requirement comes in: only report on csv files. There is no need to change the report format. And you need to get it done quickly. Michael C. Feathers's _Sprout_ method comes to the rescue: extract just the thing that you need to change, and make sure it is testable.

In this case, it is this one line that needs to change:

```csharp
var fileInfos = new DirectoryInfo(path).EnumerateFiles();
```

We can create `FileEnumerator` class:

```csharp
    public class FileEnumerator
    {
        public IEnumerable<FileInfo> GetCsvFilesIn(string path)
        {
            _ = path ?? throw new ArgumentNullException(nameof(path));

            if (!Directory.Exists(path))
            {
                throw new ArgumentException($"Path '{path} does not exist or is not a directory");
            }

            return new DirectoryInfo(path).EnumerateFiles();
        }
    }
    public class BetterFileSystemReporter
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

            var fileInfos = new FileEnumerator().GetCsvFilesIn(path);

            foreach (var file in fileInfos)
            {
                builder.AppendLine($"{file.Name}\t{file.Length}");
            }

            return builder.ToString();
        }
    }
```

Almost there; we could test this by writing out a few real files into the assembly's directory, with known file sizes. But that would be an integration test. To unit test the new class, we need to take one more step: introduce an Adapter class for our methods calls in the `System.IO` namespace. And we'll want to hide the `FileInfo` object with a new POCO, since it is difficult to fake out a `FileInfo`.

```csharp
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using NUnit.Framework;

namespace Practices_For_TDD_OO
{
   public class FileNameAndSize
    {
        public string Name { get; set; }
        public long Length { get; set; }
    }

    public interface IDirectoryBrowser
    {
        bool Exists(string path);
        IEnumerable<FileNameAndSize> EnumerateFiles(string path, string pattern);
    }

    public class FileSystemAdapter : IDirectoryBrowser
    {
        public bool Exists(string path)
        {
            return Directory.Exists(path);
        }

        public IEnumerable<FileNameAndSize> EnumerateFiles(string path, string pattern)
        {
            return new DirectoryInfo(path).EnumerateFiles(pattern)
                .Select(x => new FileNameAndSize
                {
                    Name = x.Name,
                    Length = x.Length
                });
        }
    }

    public class BetterFileEnumerator
    {
        private readonly IDirectoryBrowser _directoryBrowser;

        public BetterFileEnumerator(IDirectoryBrowser directoryBrowser= null)
        {
            _directoryBrowser = directoryBrowser ?? new FileSystemAdapter();
        }

        public IEnumerable<FileNameAndSize> GetCsvFilesIn(string path)
        {
            _ = path ?? throw new ArgumentNullException(nameof(path));

            if (!_directoryBrowser.Exists(path))
            {
                throw new ArgumentException($"Path '{path} does not exist or is not a directory");
            }

            return _directoryBrowser.EnumerateFiles(path, "*.csv");
        }
    }

    public class BestFileSystemReporter
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

            var fileInfos = new BetterFileEnumerator().GetCsvFilesIn(path);

            foreach (var file in fileInfos)
            {
                builder.AppendLine($"{file.Name}\t{file.Length}");
            }

            return builder.ToString();
        }
    }

    [TestFixture]
    public class BetterFileEnumeratorTests
    {
        [Test]
        public void GetCsvFilesIn()
        {
            const string path = "c:\\some\\where";
            var fileOne = new FileNameAndSize();

            var directoryBrowser = new FakeDirectoryBrowser();
            directoryBrowser.DirectoryExists.Add(path, true);
            directoryBrowser.Files.Add(fileOne);

            var systemUnderTest = new BetterFileEnumerator(directoryBrowser);
            var files = systemUnderTest.GetCsvFilesIn(path).ToList();

            Assert.That(files, Is.Not.Null);
            Assert.That(files.Count, Is.EqualTo(1));
            Assert.That(files[0], Is.SameAs(fileOne));

            Assert.That(directoryBrowser.EnumerateFilesWasCalled, Is.True);
            Assert.That(directoryBrowser.EnumerateFilesArguments.path, Is.EqualTo(path));
            Assert.That(directoryBrowser.EnumerateFilesArguments.pattern, Is.EqualTo("*.csv"));
        }

        private class FakeDirectoryBrowser : IDirectoryBrowser
        {
            public Dictionary<string, bool> DirectoryExists { get; } = new Dictionary<string, bool>();
            public List<FileNameAndSize> Files { get; } = new List<FileNameAndSize>();

            public bool EnumerateFilesWasCalled { get; private set; }
            public (string path, string pattern) EnumerateFilesArguments { get; private set; }

            public bool Exists(string path)
            {
                if (DirectoryExists.ContainsKey(path))
                {
                    return DirectoryExists[path];
                }

                return false;
            }

            public IEnumerable<FileNameAndSize> EnumerateFiles(string path, string pattern)
            {
                EnumerateFilesWasCalled = true;
                EnumerateFilesArguments = (path, pattern);

                return Files;
            }
        }
    }
}
```

This example has a default constructor value in the sprouted object, allowing either dependency injection or for the class to take control of its own dependency. When using Sprouting for expediency as described in the scenario, this is a useful temporary hack to minimize the damage done to the original method: it does not need to know how to create the dependencies for the sprouted class.

------------------------------

_[Back to the introduction / table of contents](intro)_
