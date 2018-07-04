---
layout: page
title: API Application Architecture
date: 2016-02-21
comments: true
category: programming
tags: [architecture]
sharing: true
---

The API for FlightNode is essentially structured along the lines of the 
[onion architecture](http://jeffreypalermo.com/blog/the-onion-architecture-part-1/) 
concept. Follow that link for a full description of the concept. Because my 
graphics toolkit is currently limited, my diagram for FlightNode has boxes 
instead of concentric onion-looking circles...

<div style="text-align: center; margin-bottom: 1em;">
<img src="/images/flightnode.onion.png">
</div>

One key takeaway is the direction of dependencies: all of the solid line
dependencies in this chart move from left to right. The Domain Entities
are at the "center" in the onion, or rightmost in this chart. They are
generally "dumb" data structures that group related fields together. The
application's core business logic is in the Domain Managers. These 
use Entities as both input and output. As with most systems, there is
a need to persist the entities somewhere - and the Domain Interfaces
define the _structure_ of the persistence API without defining
its _implementation_. Naturally the interfaces need to deal with Domain
Entities as well.

But how do we get data in and out (I/O) of the Domain Model? From the end-user
perspective, it is through an HTTP-based API. This API contains two parts
of the MVC pattern: models and controllers. The view part is completely 
separated to another project. The responsibility of the controllers 
is to handle HTTP input and output via ASP.NET WebAPI. The data transfer
objects for that I/O are the Models. The controllers serve the function
of [remote facades](http://martinfowler.com/eaaCatalog/remoteFacade.html) 
in Martin Fowler's terminology.

Concrete implementations of the persistence interfaces are no longer at 
the center of the model, as in a traditional layered architecture. This
helps liberate the domain model from attachment to any particular model
or pattern for saving the data: we could use a Repository or Table Data
Gateway; we could use any ORM; we could use SQL Server, MySQL, Azure, 
MongoDB. All that matters is that we have a classes that implement
the Domain Interfaces, and successfully store and retrieve data for
periods when the application is offline. 

Which implementation of the interfaces will be used? That depends on
how the Inversion of Control (IoC) container is configured. FlightNode
uses Unity to map an Entity Framework _context_ class, which implements
each persistence interface, to those interfaces. Then ASP.NET WebAPI 
uses the container to create the correct classes at runtime. In this 
situation, Entity Framework's _context_ class does not exactly match the
Repository pattern or any of the other traditional data access patterns.
Thus, unusually, there are no "repository classes". There are just persistence
interfaces, and the context classes.