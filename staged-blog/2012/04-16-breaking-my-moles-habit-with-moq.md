---
layout: page
title: 'Breaking My Moles Habit, With MoQ'
date: 2012-04-16
tags: [dotnet, testing]
---

![jester](/img/johnny_automatic_jester.png){: .float-right }

For several years now, I have been relying on Microsoft’s Moles for isolating one method from another in my unit tests. Recently I’ve begun to understand that this was not the best approach. I’ll dig into that more in a future post. Having come to this conclusion, I need to start ripping out Moles. Based on the user feedback across the web, and the powerful Lambda expression syntax I’ve grown used to, I’ve chosen MoQ as my replacement. Now for an exercise&hellip;

```csharp
XYZ.Business.AppFacades.Moles.MSomeFacade.AllInstances.GetAllInt32Int32IOrderBy
    = (SomeFacade iFacade, int iStartRow, int iRowcount, IOrderBy iOrderBy) =>
        {
            Assert.AreEqual(startRow, iStartRow, "getall - wrong start row");
            Assert.AreEqual(rowCount, iRowcount, "getall - wrong row count");
            Assert.IsInstanceOfType(iOrderBy, typeof(OrderBySomeProperty), "getall - sort order");
            Assert.IsFalse(iOrderBy.Descending, "getall - descending");

            return new List() { someInstantiatedObject };
        };

        // Run the system under test
        SomeController target = m_kernel.Get();
```

Replace with…

```csharp
var mockFacade = new Mock(MockBehavior.Strict);
mockFacade.Setup(ibf => ibf.GetAll(It.Is(i => i == startRow),
    It.Is(j => j == rowCount), It.Is(k => k is OrderBySomeProperty))
    ).Returns(
        (int iStartRow, int iRowcount, IOrderBy iOrderBy) =>
        {
            return new List() { someInstantiatedObject };
        }
    );

m_kernel.Bind().ToConstant(mockFacade.Object);
```

Thanks to the Strict behavior, I end up getting an error on another method in the facade class. An explicit mocking is needed for that one too:

```csharp
mockFacade.Setup(ibf => ibf.GetRowCount()).Returns(1);
```

In the Moles example, I would have ended up hitting the real `GetRowCount` method without realizing it. If I hadn’t implicitly setup a fake database with that Ninject call `m_kernel.Get<SomeController>`, the `GetRowCount` method would have actually queried the database. As a unit test, this is precisely what I was trying to avoid with Moles.

I have lost one thing in translation &ndash; if one of the arguments is wrong, it can be a little more difficult to tell why. In the Moles example, I have the explicit Assert statements in the body of the Mole. In the MoQ example, with Strict behavior turned on, I am telling Mock to throw an error if any criteria other than those three Lambdas attached to `It.Is<T>(Func<T,bool>)` is passed to the `GetAll` method. When I manually mess up one of the input values to the test method, I get this result:

```none
Test method MyTest.SortIndexPageTwoByAddressAscending threw exception: Moq.MockException: ISomeFacade.GetAll(3, 3, XYZ.Business.DTO.Sortable.OrderBySomeProperty) invocation failed with mock behavior Strict. All invocations on the mock must have a corresponding setup.
```

With the Moles example, I would have seen `Assert.AreEqual failed. Expected:<1>. Actual:<3>. getall - wrong start row`, which is a little more explicit. In the MoQ example I know that there is a problem with the arguments; the third one was just a test of type, and it is clear that it is not the cause. So I must look to the two ints. Still, that is not all that difficult: I know that I have the values 3 and 3, and all I must do is look at the value of startRow and of rowCount to see which one is not three. Then I’ll understand which failed. That only takes me a few seconds longer.

Of course, I could switch back from Strict to Loose behavior on the Mock, which would allow me to put those Assert statements into the body of the Mock. But then I lose the benefit of getting a failure if there are unexpected method calls. I think I’ll accept the small inconvenience above in return for the huge convenience of verifying that the system under test isn’t explicitly or implicitly calling some other method in `ISomeFacade`.
