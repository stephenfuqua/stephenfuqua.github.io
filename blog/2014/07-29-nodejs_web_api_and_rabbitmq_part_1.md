---
title: Node.js, Web API, and RabbitMQ. Part 1
date: '2014-07-29'
slug: nodejs_web_api_and_rabbitmq_part_1
tags:
- tech
- programming
- javascript
- dotnet

---

Desiring to learn about both Node.js (particularly as an API server) and ASP.Net
Web API, I decided to throw one more technology in the mix and see which one is
faster at relaying messages to a service bus, namely, RabbitMQ. Naturally, such
a test does nothing to prove that one framework is generally faster than the
other, but it is a fun exercise nonetheless.

Thus the challenge is this: accept a string message via POST, forward it to the
service bus, and return HTTP Status Code 202 (Accepted) along with an
acknowledgment that repeats the original message. Both REST services should be
self-hosted; free from additional cruft like error-handling*; and should utilize
an url like `http://localhost:port/Message/mymessage`, where "mymessage" is the
string to be sent across the bus.

<!-- truncate -->

> "Simplicity &mdash; the art of maximizing the amount of work not done &mdash;
> is essential," to quote the [Principles behind the Agile
> Manifesto](https://agilemanifesto.org/principles.html). This is just demo
> code!

In test-driven fashion, I decided to start with an automated test harness that
would run each API, send a message to the bus, and consume the message in order
to verify that it was received correctly. The test harness is using a Visual
Studio Test Project. Admittedly, I did not know enough about the tools to write
this in a full TDD fashion, but let's just pretend that the tests were fully
written before the real code.

I'm going to throw out a lot of sample code here. Hopefully it is well-written
enough that it doesn't need extensive commentary. First, the node.js test:

```csharp
[TestClass]
public class NodejsTest
{
    private IServiceBus _serviceBus;
    private const string RABBIT_URL = "rabbitmq://localhost:5672/apitest_webapi";
    private const string NODEJS_URL = "http://localhost:10025/";
    private const string MESSAGE_REQUEST = "Message/{0}";
    private const string NODEJS_PACKAGE = @"""somepath\RabbitMqAPI\app.js""";
    private const string NODE_EXECUTABLE = @"""C:\Program Files\nodejs\node.exe""";
    private Process _webServer;

    [TestInitialize]
    public void Initialize()
    {
        _serviceBus = Helper.SetupBusMonitoring(RABBIT_URL);
    }


    [TestMethod]
    public void SendAMessageToRabbitMQUsingNodeJs()
    {
        var messageContent = "one small step for a man...";

        GivenNodeJsApiIsRunning();
        Helper.WhenTheApiIsCalled(messageContent, MESSAGE_REQUEST, NODEJS_URL);

        Helper.ThenTheMessageShouldHaveBeenSentToTheBus(messageContent);
    }

    [TestCleanup]
    public void TestCleanup()
    {
        _serviceBus.Dispose();

        if (!_webServer.HasExited)
        {
            _webServer.Kill();
            _webServer.Dispose();
        }
    }

    private void GivenNodeJsApiIsRunning()
    {
        var processStartInfo = new ProcessStartInfo
        {
            Arguments = NODEJS_PACKAGE,
            FileName = NODE_EXECUTABLE,
            ErrorDialog = true,
            UseShellExecute = true
        };

        try
        {
            _webServer = Process.Start(processStartInfo);
        }
        catch (Win32Exception exception)
        {
            Assert.Fail(exception.ToString());
        }
    }
}
```

And now the ASP.Net test:

```csharp
[TestClass]
public class WebAPITest
{
    private const string RABBIT_URL = "rabbitmq://localhost:5672/apitest_webapi";
    private const string WEBAPI_BASE_ADDRESS = "http://localhost:10026/";
    private const string MESSAGE_ROUTE = "/Message/{0}";
    private WebApiRunner _webServer;
    private IServiceBus _serviceBus;

    [TestInitialize]
    public void Initialize()
    {
        _serviceBus = Helper.SetupBusMonitoring(RABBIT_URL);
    }

    [TestMethod]
    public void SendAMessageToRabbitMQUsingWebAPI()
    {
        var messageContent = "Hola mundial";

        GivenWebApiIsRunning();

        Helper.WhenTheApiIsCalled(messageContent, MESSAGE_ROUTE, WEBAPI_BASE_ADDRESS);

        Helper.ThenTheMessageShouldHaveBeenSentToTheBus(messageContent);
    }

    [TestCleanup]
    public void Cleanup()
    {
        _webServer.Stop();
        _serviceBus.Dispose();
    }

    private void GivenWebApiIsRunning()
    {
        // Unlike service bus, I moved this out of Initialize to help clarify the essential test conditions -
        // that is, to clarify that the API is running. The fact that we're monitoring the bus is a little
        // more incidental and showing that directly in the test (as opposed ot the Initialize() method)
        // does aid in understanding what is being tested.

        _webServer = new WebApiRunner();

        _webServer.Start();
    }
}
```

And now the Helper class:

```csharp
    public static void WhenTheApiIsCalled(string messageContent, string routing, string baseAddress)
    {
        using (var client = new HttpClient())
        {
            client.BaseAddress = new Uri(baseAddress);
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));

            var response = client.GetAsync(string.Format(routing, System.Net.WebUtility.UrlEncode(messageContent)));

            Assert.AreEqual(HttpStatusCode.Accepted, response.Result.StatusCode, "expected code 202");
        }

        Thread.Sleep(500);
    }


    public static IServiceBus SetupBusMonitoring(string queueAddress)
    {
        var bus = ServiceBusFactory.New(x =>
        {
            x.UseRabbitMq();
            x.ReceiveFrom(queueAddress);
            x.DisablePerformanceCounters();

            x.Subscribe(s =>
            {
                s.Consumer(() => new ApiTestConsumer());
            });
        });

        return bus;
    }

    public static void ThenTheMessageShouldHaveBeenSentToTheBus(string messageContent)
    {
        Assert.AreEqual(messageContent, ApiTestConsumer.ReceivedMessage, "proper message was not received");
    }
}
```

The `ApiTestConsumer` class is relatively straight-forward and ellided for
brevity. Note that the service bus is being accessed with the help of [MassTransit](http://docs.masstransit-project.com/en/latest/). While
MassTransit is rather helpful in .Net to .Net messaging across either RabbitMQ
or MSMQ, it turned out that it introduces some interesting challenges with
respect to using anything _other than MassTransit_ to publish a message. In
other words, fast forwarding to a future post here, I had to be very particular
about the way I sent my message to the bus using Node.js, in order for it to be
consumed by `ApiTestConsumer`.

At this point, the code compiles &mdash; `WebApiRunner` is a real class
implementing `IDisposable`, and app.js really does exist. But they don't do
anything and the tests are Red. In the next post, I'll explore the Web API code.
