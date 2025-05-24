---
title: 'Breaking Down a Unit Test from "Reggie" That Uses MoQ'
date: 2012-04-21
tags: [dotnet, testing]
---

Test driven development is hard. Perhaps it would not be if we were taught to think about OO development from a TDD perspective in the first place; but those muscles are poorly developed, and the exercise leaves you sore and panting a bit. As with physical exercise, there is a reward in the pain. Perhaps others do not see it, but I can already see the benefits accruing in [Reggie](https://github.com/stephenfuqua/reggie) as I rebuild it with [SOLID principles](https://en.wikipedia.org/wiki/SOLID) in mind, driven by tests. To help me consolidate where I’m going, and help others whose TDD muscles are likewise under-developed, let us walk through a test, shall we?

First, some context. I’m working on adding persistence to the application: ability to save and re-open session data. I have a [ViewModel](http://en.wikipedia.org/wiki/Model_View_ViewModel), called `ReggieBasicViewModel`, which initially contains the data to persist and which binds the View to my business logic. The ViewModel is being instantiated with a factory object, which allows the ViewModel to build concrete instances of various dependencies. This illustrates the [Abstract Factory pattern](https://www.oodesign.com/abstract-factory-pattern.html), and the [Open-Closed Principle](https://docs.microsoft.com/en-us/archive/msdn-magazine/2008/june/patterns-in-practice-the-open-closed-principle), but arguably violates Single Responsibility Principle [same link as OCP] by grouping un-related functionality into the factory. The proper factory object is configured in the application’s bootstrapper class, or or it is setup in a unit test using an alternate factory implementation.

{: .center-block}
![Class model diagram](/img/diggingIntoTests1.png)<!-- {: .img-fluid .border .rounded } -->

![ISessionPersistence](/img/diggingIntoTests2.png){: .float-right .border .rounded }

I’d like to save to / retrieve from an XML file. But what if my requirements change in a few days? I’m told to save to a database, or a web service. It would not be wise to design for that – but I can easily make the system flexible enough to handle addition of other types of persistence in the future. So I create an interface in my business layer, called `ISessionPersistence`. As you can see, I’ve added a factory method to the `IHelperFactory`, for building an instance of `ISessionPersistence`.

```csharp
[TestMethod]
public void SaveSessionLoadsSessionIntoPersistenceService()
{
    // Prepare Input
    string sampleText = "Reggie";
    string regularExpressionPattern = "^(Reggie)$";

    // Setup mocks
    Mock mockSession = m_mockFactory.Create<IReggieSession>();
    mockSession.SetupSet(ms => ms.RegularExpressionPattern =
        It.Is<string>(x => x == regularExpressionPattern));
    mockSession.SetupGet(ms => ms.RegularExpressionPattern)
        .Returns(regularExpressionPattern);
    mockSession.SetupSet(ms => ms.SampleText =
        It.Is<string>(x => x == sampleText));
    mockSession.SetupGet(ms => ms.SampleText).Returns(sampleText);

    m_helperFactory.Setup(hf => hf.BuildReggieSession())
                   .Returns(mockSession.Object);

    m_persistence.Setup(p => p.Save(It.Is<IReggieSession>(x =>
        x.SampleText == sampleText
        && x.RegularExpressionPattern == regularExpressionPattern)));

    // Call the system under test
    m_systemUnderTest.SampleText = sampleText;
    m_systemUnderTest.RegularExpressionPattern = regularExpressionPattern;
    m_systemUnderTest.SaveSession();

    // Evaluate results
    m_persistence.Verify(p => p.Save(It.IsAny<IReggieSession>()), Times.Once());
}
```

Let’s step through that&hellip;

```csharp
// Setup mocks
Mock<IReggieSession> mockSession = m_mockFactory.Create<IReggieSession>();
```

Use MoQ to create a mockup of an `IReggieSession`. I forgot to mention this: it is a small interface for holding the Sample Text and Regular Expression Pattern that will be saved.

<div class="text--center">
![IReggieSession interface](/img/diggingIntoTests3.png)<!-- {: .img-fluid .border .rounded } -->
</div>

```csharp
 mockSession.SetupSet(ms => ms.RegularExpressionPattern = It.Is<string>(x => x == regularExpressionPattern));
mockSession.SetupGet(ms => ms.RegularExpressionPattern).Returns(regularExpressionPattern);
mockSession.SetupSet(ms => ms.SampleText = It.Is<string>(x => x == sampleText));
mockSession.SetupGet(ms => ms.SampleText).Returns(sampleText);
```

 Now add some meat to that mock object by setting up the Get and Set for the two properties, `RegularExpressionPattern` and `SampleText`:

* The SetupSet line can be read this way: RegularExpressionPattern_Set is allowed to be called with a value matching the regularExpressionPattern variable.
* The SetupGet can can be read as saying: RegularExpressionPattern_Get will return the value of regularExpressionPattern.
* Etc.

```csharp
m_helperFactory.Setup(hf => hf.BuildReggieSession())
    .Returns(mockSession.Object);
```

When the factory’s BuildReggieSession method is called, return the mock Session object.

```csharp
m_persistence.Setup(p => p.Save(It.Is<IReggieSession>(x => x.SampleText == sampleText
    && x.RegularExpressionPattern == regularExpressionPattern)));
```

Create a mock persistence engine – _this helps us remember that the method we’re implementing does not care how the session is persisted!_ It will simply use whatever method is configured in the factory, which in turn was configured by the main application’s bootstrapper class and passed into the ViewModel’s constructor. FYI, the factory and persistence mocks were instantiated with Strict behavior in the test fixture’s TestInitialize method, so these are member variables for the class and the test will fail if any method is called that has not be explicitly setup. Read this line thusly: setup the persistence mock so that the Save command is allowed to be called with a `IReggieSession` whose `SampleText` has the value of sampleText and `RegularExpressionPattern` has the value of "regularExpressionPattern".

```csharp
// Call the system under test
m_systemUnderTest.SampleText = sampleText;
m_systemUnderTest.RegularExpressionPattern = regularExpressionPattern;
m_systemUnderTest.SaveSession();
```

This is clear enough. The system under test is an instance of `ReggieViewModel`, that was constructed in the `TestInitialize` method. Normally I would put the construction directly in the test, but in this test fixture, all of the tests need to be initialized in the same way. Moving that to `TestInitialize` reduces redundant code.

```csharp
// Evaluate results
m_persistence.Verify(p => p.Save(It.IsAny<IReggieSession>()), Times.Once());
```

This line verifies that the Save method was called exactly one time, with any `IReggieSession` object. The exact object values do not matter, because I already configured the test to accept the particular values in the local variables.

Run the test. It fails. Great! Fill in the method body. It does not matter that I do not have a concrete version of `ISessionPersistence` yet, since I am programming against the interface. Now the test passes! The next step is clear: write a test for a concrete persistence class that saves sessions to XML. This will, by definition, be an integration test, writing an actual file. That is, unless I add another layer of abstraction: wrap the XML serialize/deserialize in a reusable custom class, and call that custom class from the persistence class.

```csharp
/// Save the current input values for future use.
///

 public void SaveSession()
 {
     var session = m_helperFactory.BuildReggieSession();
     session.SampleText = this.SampleText;
     session.RegularExpressionPattern = this.RegularExpressionPattern;

     m_persistence.Save(session);
 }
```
