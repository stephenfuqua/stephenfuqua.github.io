---
layout: page
title: "Another Adapter Example"
permalink: /best-practices-tdd-oo/additional-adapter-example
date: 2020-01-16
comments: true
tags: [unit-test, programming, oo]
---

Here is a class that was introduced in [Legacy Refactoring](legacy-refactoring):

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

A new requirement comes in: only report on csv files. There is no need to change the report format, as was done in the original example. In this case, it is this one line that needs to change:

```csharp
var fileInfos = new DirectoryInfo(path).EnumerateFiles();
```

The Seam method in [Legacy Refactoring](legacy-refactoring) could be used to isolate this one line. As noted in that article, that method was quick and effective, but not ideal in the long-term. Plus, it would more difficult in this case because `fileInfos` is an enumeration of `FileInfo` objects, and `FileInfo` is not a mockable class. I suppose one could create a test-specific sub-class. Anwyay, we're going to proceed with creation of Adapters for the file system objects.

First, create a `FileEnumerator` class to encapsulate the original code:

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

Good start, but not yet unit testable. Second, extract an interface for the new class, and create a POCO to house the relevant `FileInfo` data:

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

        public BetterFileEnumerator(IDirectoryBrowser directoryBrowser = null)
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
```

Now look how easy it is to mock that adapter and unit test the original class:

```csharp
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
