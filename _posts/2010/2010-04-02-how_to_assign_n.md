---
layout: page
title: How to assign namespace and action to FaultContract in ServiceContract Interface
  (Web Service Software Factory)?
date: '2010-04-02 09:39:13 -0500'
basename: how_to_assign_n
tags:
- tech
- dotnet
- programming
excerpt_separator: <!--more-->
---

I am using the latest edition of Service Factory - Modeling Edition (VS2008).
I've created a number of FaultContracts in my DataContract model, and utilized
them in my ServiceContract model. The generated code for the ServiceContract
does not include the namespace or action for the FaultContract, e.g.

<!--more-->

```csharp
[WCF::ServiceContract(Namespace = "http://mynamespace", Name = "MyServiceContract", SessionMode = WCF::SessionMode.Allowed, ProtectionLevel = ProtectionLevel.None )]
public partial interface IMyServiceContract 
{
	[WCF::FaultContract(typeof(MyFaultContract))]
	[WCF::OperationContract(IsTerminating = false, IsInitiating = true, IsOneWay = false, AsyncPattern = false, Action = "http://mynamespace/Contract/GetSomething", ProtectionLevel = ProtectionLevel.None)]
	PcaFocus.MessageContracts.GetSomethingResponse GetSomething(GetSomethingRequest request);
```

Whereas I expected the FaultContract attribute to be something like:

```csharp
[FaultContract(typeof(MyFaultContract), Namespace = "http://mynamespace", Action = "http://mynamespace/MyFaultContract", Name = "MyFaultContract")]
```

The effect is that the different Fault types <a
href="https://connect.microsoft.com/VisualStudio/feedback/details/437564/faultexception-t-doesn-t-work-right-with-multiple-fault-contract-detail-types-that-are-related-derived-from-each-other-and-when-using-basichttpbinding?wa=wsignin1.0">are
not recognized </a> because of a de-serialization problem. That has the effect
that I cannot catch specific faults with

```csharp
catch (System.ServiceModel.FaultException<MyFaultContract> fault)
```

Does anyone know of a work-around for this?
