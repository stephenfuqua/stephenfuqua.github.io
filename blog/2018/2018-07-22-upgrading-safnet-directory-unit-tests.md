---
title: "Upgrading safnet-directory, Part 2: Unit Tests"
date: 2018-07-21
tags: [dotnet, architecture, testing]
sharing: true
---

Continuing from [Upgrading safnet-directory, part 1](/archive/2018/07/15/upgrading-safnet-directory/), it is time to improve the solution's unit testing. At the outset, the controllers cannot be unit tested effectively due to their direct dependence on Entity Framework and ASP.NET Identity Framework classes. With application of an in-memory database, they could be _integration tested_, but not _unit tested_ as I understand and apply the term.

## Interfaces and Dependency Injection

The data access needs to be pulled from the controllers, and the classes need to be  refactored for inversion of control / dependency injection. In a larger application I would create three layers with distinct responsibilities:

1. Controllers - interact with HTTP requests, delegating work to
1. Services - contain business logic and requests to external systems in
1. Data - for accessing data in databases or external services

Given that there is no significant business logic in this application, new code in the middle layer is not worth the effort. But I will extract a simple data layer. It will not be as comprehensive an interface as I would make in a larger app, but it will be effective in isolating the Controllers from Entity Framework.  ASP.NET Identity classes are already encapsulating logic around authentication, and they can remain - so long as they have proper interfaces and can be injected into controllers.

For dependency injection, I know that ASP.NET Core (coming in a future article) has its own good system. I have heard kind words spoken about Simple Injector but never tried it out before.

```PowerShell
PM> Install-Package SimpleInjector.Integration.WebApi
```

I'll configure registrations with Scoped lifestyle so that objects are tracked and disposed of properly. In anticipation of future async work, I'll setup [async scoped](https://simpleinjector.readthedocs.io/en/latest/lifetimes.html#asyncscoped) as a default. Along with Simple Injector, I will create an interface for the existing `ApplicationDbContext` class, and call it `IDbContext`. Adding this method to my `Startup` class:

```csharp
private void ConfigureDependencyInjection(HttpConfiguration config)
{
    var container = new Container();
    container.Options.DefaultScopedLifestyle = new AsyncScopedLifestyle();

    container.Register<IDbContext, ApplicationDbContext>(Lifestyle.Scoped);

    container.RegisterWebApiControllers(config);
    container.Verify();

    config.DependencyResolver =
        new SimpleInjectorWebApiDependencyResolver(container);
}
```

On the MVC-side of the house, I was using Owin as a cheap dependency manager for authentication with ASP.NET Identity framework. I will leave this alone for the moment, since that will likely require more radical change in the .NET Core future anyway.

The members of the `IDbContext` were easy to identify, based on how the Controllers were using `ApplicationDbContext`. One of those members returns an `IQueryable`. For unit testing, I need to be able to mock it. [MockQueryable](https://github.com/romantitov/MockQueryable) will do nicely. It seems that it is also time to Install my [preferred unit testing tools](/archive/2018/07/04/dotnet-testing-tools/), [NUnit 3](http://nunit.org/) and [FluentAssertions](https://fluentassertions.com/).

```PowerShell
> Install-package MockQueryable.Moq
> Install-Package NUnit
> Install-Package NUnit3TestAdapter
> Install-Package FluentAssertions
```

## From Visual Studio Testing to NUnit

First, manually remove the reference to `Microsoft.VisualStudio.QualityTools.UnitTestFramework`. Next,  find-and-replace VSTest attributes with NUnit. The most common changes:

| Old | New |
|-----|-----|
| using Microsoft.VisualStudio.TestTools.UnitTesting; | using NUnit.Framework; |
| \[TestClass] | \[TestFixture] |
| \[TestInitialize] | \[SetUp] |
| \[TestCleanup] | \[TearDown] |
| \[TestMethod] | \[Test] |
{: .table .table-striped}

Here is a PowerShell script to fix these up:

```PowerShell
$replacements = @{
    "using Microsoft.VisualStudio.TestTools.UnitTesting" = "using NUnit.Framework";
    "[TestClass]" = "[TestFixture]";
    "[TestInitialize]" = "[SetUp]";
    "[TestCleanup]" = "[TearDown]";
    "[TestMethod]" = "[Test]"
}

Get-ChildItem *Tests.cs -recurse | ForEach {
    $fileContents = (Get-Content -Path $_.FullName)

    $replacements.Keys | ForEach {
        $fileContents = $fileContents.Replace($_, $replacements.Item($_))
    }

    $fileContents |  Set-Content -Path $_.FullName
}
```

## Removing Dependency on `Thread.CurrentPrincipal`

There is another hard-coded dependency that needs to be lifted in order to fully unit test the API `EmployeeController`: it uses the Thread.CurrentPrincipal to interrogate the user's Claims. If the user is not in the "HR" role then it strips off the identifier values from the records before responding to the HTTP client. This can then signal that the client should not try to edit these records (note that the `Post` method is already authorized only for HR users, thus giving defense in depth). For a moment I thought about extracting an interface for accessing this information, but then I remembered that  `ApiController.User` property and confirmed that it has a setter. Thus it is trivial to inject a fake user with fake claims:

```csharp
[SetUp]
public void SetUp()
{
    _mockDbContext = new Mock<IDbContext>();
    _controller = new EmployeeController(_mockDbContext.Object);

    // Setup the current user as an HR user so that Id values will be mapped for editing
    var mockPrincipal = new Mock<IPrincipal>();

    var mockIdentity = new Mock<ClaimsIdentity>();
    mockIdentity.Setup(x => x.Claims)
        .Returns(new[] { new Claim(ClaimTypes.Role, AdminController.HR_ROLE) });

    mockPrincipal.Setup(x => x.Identity)
        .Returns(mockIdentity.Object);

    _controller.User = mockPrincipal.Object;
}
```

## Extending the Unit Test Code Coverage

At last it is possible to fully unit test this class: the database connection has been mocked and the tests can control the user's claimset. What about the other classes? There are some that will never be tested - e.g. the database migration classes and the data context class; these should be decorated with `[ExcludeFromCodeCoverage]`. It would be nice to find out what my code coverage is. Without Visual Studio Enterprise or DotCover we need to turn to OpenCover. Let's try [AxoCover](https://github.com/axodox/AxoCover) for integrating OpenCover into Visual Studio.

![Axo Cover Results in Visual Studio](/images/axo-cover-1.png)

Not bad. The display that is. Coverage isn't very good; 35.8% of lines. However note that it did not ignore the Migrations. I forgot that OpenCover does not automatically ignore classes / methods decorated with either `[GeneratedCode]` or `[ExcludeFromCodeCoverage]`. Is there a setting in Axo? Yes. And in fact it did ignore `ExcludeFromCodeCoverage`. I just need to add `GeneratedCode` to the list: `;*GeneratedCodeAttribute`

![Axo Cover Settings](/images/axo-cover-2.png)

Now we have a full 36.7% of lines! Before trying to fill in the missing unit tests, perhaps there is some more cleanup in order:

1. Exclude ASP.NET configuration classes - is there really value in unit testing `BundleConfig`, `FilgerConfig`, `RouteConfig`, or `Startup`?
1. In addition, there are some unused methods related to two-factor authentication that can be removed from both the Identity management code and from the MVC `AccountController` and `ManageController`.

Eliminating unneeded code brought me up to 52.6% code coverage. Much of the uncovered code is related to ASP.NET Identity, and I suspect that code will change significantly in the upgrade to ASP.NET Core. Perhaps it is not worth taking the time to fill in missing unit tests for those methods and classes right now. Sole remaining focus for unit testing will be the `EmployeeController` - bringing it, at least, to 100% coverage.

Full file diffs in [pull request 2](https://github.com/stephenfuqua/safnetDirectory/pull/2).
