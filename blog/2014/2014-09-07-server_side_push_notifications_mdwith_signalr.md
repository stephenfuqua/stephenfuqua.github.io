---
title: Server Side Push Notifications With SignalR
date: '2014-09-07'
slug: server_side_push_notifications_with_signalr
tags:
- tech
- programming
- javascript
- dotnet

---

Many social websites, and web-based applications, have a notification process
where the server sends a signal back to the browser, informing that particular
user that there is a message. "You've got mail," as America On-Line used to say
it. Consider the picture below, from Twitter, which shows that I have one new
notification. That number increments automatically when a new notification
arrives, without having to reload the full page. How does that work? Well, this
blog post doesn't try to answer that directly. In fact, it is simply a
collection of notes pointing out how to use Microsoft's SignalR technology to
achieve this.

![example from Twitter](/images/twitterNotification.jpg){: .text-center}

<!-- truncate -->

## Pushing With SignalR

This style of real-time communication requires either a push or a pull
mechanism: is the browser going to pull notifications from the server every few
seconds (polling)? Or will the server push notifications to the browser (remote
procedure call, RPC)? Polling is considered to be more resource intensive of the
two: it requires constantly opening and closing connections, and frequently
asking "got anything for me?". If there is a message for the browser on one of
every 1000 requests, then that's 999 connections that wasted bandwith on the
server (the client might not care, but this adds up on the server over time).
Better to keep a single connection open between the browser and client, and push
messages out just in time.

[SignalR](http://signalr.net/) is Microsoft's technology for managing
that RPC push. It is an open source .Net (server side) and JavaScript (client
side) technology that will work with any modern browser. It does this by
detecting the browser capability and choosing the most efficient of several RPC
options for that browser. While relatively easy to use, it does have some
gotchas that can really trip you up.

## Server-Side Push

There are two primary interaction styles: one where the server is pushing out
messages, and another where the server is just a proxy for client-to-client
messaging (almost acting as an enterprise service bus). Think of a multi-player
game or a chat room in the latter case. Interesting, but not what I wanted to
know. Therefore I'll stick with the server side. Here are some useful
references:

* [ASP.NET SignalR Hubs API Guide - Server (C#)](http://www.asp.net/signalr/overview/signalr-20/hubs-api/hubs-api-guide-server)
* [Tutorial: Server Broadcast with SignalR 2](http://www.asp.net/signalr/overview/signalr-20/getting-started-with-signalr-20/tutorial-server-broadcast-with-signalr-20) (Stock Ticker)
* [Mapping SignalR Users to Connections](http://www.asp.net/signalr/overview/signalr-20/hubs-api/mapping-users-to-connections). In other words, this gives you the critical knowledge for sending a message to the right person, not just everyone.
* These guides come from [Learn About ASP.Net SignalR](http://www.asp.net/signalr/overview/signalr-20), which has quite a bit of other important documentation around security, troubleshooting, scalability, and client-side scripting.

## Dependency Injection

When your SignalR code needs any outside resource, you will need to set up a
`DependencyResolver` to manage [Dependency
Injection](http://www.asp.net/signalr/overview/signalr-20/extensibility/dependency-injection) (DI). Ultimately you just need a simple class that implements [IDependencyResolver](http://msdn.microsoft.com/en-us/library/system.web.http.dependencies.idependencyresolver%28v=vs.118%29.aspx)
(the System.Web.Http version, not the System.Web.Mvc interface with the same
name and purpose). As shown in the DI link above, it is trivial to build an
adapter so that <acronym title="Inversion of Control">IoC</acronym> container
can act as this resolver. Alternately, you could hard-code any simple
dependencies into a custom resolver, but I wouldn't recommend it.

Once you have the resolver, it is easy to use it in a `HubConfiguration` while
starting up the SignalR server:

```csharp
public class Startup
{
    public void Configuration(IAppBuilder app)
    {
        var config = new HubConfiguration();
        config.Resolver = SomeMethodThatBuildsYourResolver();
        app.MapSignalR(config);
    }
}
```

But there is a problem with doing this. And it eluded me for quite a while,
causing me substantial angst. In the StockTicker tutorial sited above, we are
introduced to the `GlobalHost` for classes outside the Hub to interact with that
Hub, and thus to send messages to clients. Once you introduce a
`DependencyResolver` into an individual mapping, the `GlobalHost` needs to know
about it too. Otherwise, it cannot instantiate a hub for you properly. There
will be no compile-time or run-time errors. But the system just won't work. If
you build the StockTicker example and add a `DependencyResolver` as shown above,
the outcome will be rather boring. One small change will fix that though (thank
you, [StackOverflow](http://stackoverflow.com/questions/21126624/signalr-autofac-owin-why-doesnt-globalhost-connectionmanager-gethubcontext/21126852#comment40181303_21126852)):

```csharp
public class Startup
{
    public void Configuration(IAppBuilder app)
    {
        var config = new HubConfiguration();
        GlobalHost.DependencyResolver  = SomeMethodThatBuildsYourResolver();
        app.MapSignalR(config);
    }
}
```

Note that the `HubConfiguration` is no longer in use. I left it there because
there as a reminder that one might like to inquire about [other
useful settings](http://msdn.microsoft.com/en-us/library/microsoft.aspnet.signalr.hubconfiguration_properties%28v=vs.118%29.aspx) that can be injected via this object.

## Sending to a Single User

The Stock Ticker example broadcasts to everyone. How do you send a message to
a single user? The references above have a link with more detail. There are
several ways to solve this problem. The **In-Memory Storage** method is a good
option, except that you might as well use thread-safe collections and avoid
having use a `lock`. Replace `Dictionary` with `[ConcurrentDictionary](http://msdn.microsoft.com/en-us/library/dd287191%28v=vs.110%29.aspx)`
and `HashSet` with `[ConcurrentBag](http://msdn.microsoft.com/en-us/library/dd381779%28v=vs.110%29.aspx)`.
Or, stick with the locking and use the experimental `[MultiValueDictionary](http://blogs.msdn.com/b/dotnet/archive/2014/08/05/multidictionary-becomes-multivaluedictionary.aspx)`.

## Updating the Client Browser

The Stock Ticker example sends a particular message to the browser. For a little
notification count as shown in the Twitter screenshot, we can create a new
client-side JavaScript function, adding it to the StockTicker.js file. Here's a
stub entry for a new "notify" function:

```javascript
// ** TUTORIAL CODE **
// Add a client-side hub method that the server will call
ticker.client.updateStockPrice = function (stock) {
    var displayStock = formatStock(stock),
        $row = $(rowTemplate.supplant(displayStock));
$stockTableBody.find('tr[data-symbol=' + stock.Symbol + ']')
        .replaceWith($row);
    }

// ** NEW CODE **
ticker.client.notify = function() {
}
```

On the server, you can add this to the StockTicker class (leaving
`LookupConnectionIdFromConcurrentDictionary` as an exercise for the reader):

```csharp
public void NotifyUser(string userToNotify)
{
    var connectionId = LookupConnectionIdFromConcurrentDictionary(userToNotify);
    Clients.Client(connectionId).notify();
}
```

Back in the browser, obviously you need to do something other than just define
an empty function. Let's assume the HTML has a `&lt;div
id="notification"&gt;0&lt;div&gt;`. Simply grab the current value and increment
it with the help of jQuery:

```javascript
ticker.client.notify = function() {
    var div = $("#notification");
    var value = parseInt(div.text());
    div.text(++value);
}
```
