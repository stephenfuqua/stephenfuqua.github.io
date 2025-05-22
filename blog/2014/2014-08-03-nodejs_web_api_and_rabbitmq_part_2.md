---
title: Node.js, Web API, and RabbitMQ. Part 2
date: '2014-08-03'
slug: nodejs_web_api_and_rabbitmq_part_2
tags:
- tech
- programming
- javascript
- dotnet

---

_Desiring to learn about both Node.js (particularly as an API server) and
ASP.Net Web API, I decided to throw one more technology in the mix and see which
one is faster at relaying messages to a service bus, namely, RabbitMQ._

_This is part two in a series. [Part 1](/archive/2014/07/29/nodejs_web_api_and_rabbitmq_part_1/)._

Let's start with Node.js. I already let you in on the fact that formatting a
message for .Net to pick it up is tricky, and I won't get into the detail of
that yet. For now, let's concentrate on setting up node.js and communicating
with RabbitMQ. We'll get the finer points of interacting with .Net later.

<!-- truncate -->

So this is my first project in Node.js. I'm not going to claim any expertise or
try to explain the framework. I first learned it in an HTML 5 meetup meeting
with Eric Sowell, who also claims not to be a Node.js expert, but he certainly
did a great job of clearing the path. His blog post [Enough Node.js](http://ericsowell.com/blog/2014/6/16/enough-node)
brings those pieces together in written form and I recommend heading over there
my post is diving in too deep right away.

Although Eric's a .Net guy, he seems to like the Mac and SublimeText in his
avocational capacity. But for me, I wanted to stick to Visual Studio. So the
first thing I did was install the [Node.js Tools for Visual Studio](https://nodejstools.codeplex.com/).
I'm happy to say it is a very functional and useful add-in. Back to Eric's lead,
I decided to use [express](http://expressjs.com/) as my node web
server. I decided to go with [node-amqp](https://github.com/postwait/node-amqp) for interacting with
RabbitMQ. There were other options, but the documentation and age of this
project convinced me to give it a shot. [CloudAMQP](http://www.cloudamqp.com/docs/nodejs.html) has additional
documentation and samples that were quite helpful in pulling this together. As
you'll see, the code was quite simple in the end. But, being my first foray into
JSON and closures, a lot more learning went into this than is readily apparent.

Enough talk. Code. Setup the dependencies and the shell of the web server. [Part
1](/archive/2014/07/29/nodejs_web_api_and_rabbitmq_part_1/) describes the expected functionality and the RESTful format. This lets us
use `http://localhost:10025/Message/helloWorld`.

```javascript
/**
 * Module dependencies.
 */
var express = require('express');
var http = require('http');
var amqp = require('amqp');

/**
 * Web Server setup.
 */
var app = express();

app.set('port', process.env.PORT || 10025);

/**
 * A RESTful GET request handler
 */
app.get('/Message/:message', function(request, response) {

    var message = request.params.message;
    console.log('Received message: ' + message);

    // rabbit stuff goes here

    response.writeHead(202);
    response.end();
});

/**
 * Start the web server
 */
http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
```

It was great to learn, thanks to some post or other, about good use of
JavaScript namespaces and using `||` as a null-coalescing operator.
`console.log(...)` was another win that only recently came to my attention.

Now, what about interacting with RabbitMQ? Let's have a brief digression into
service bus theory. Again, this is far from expert commentary. I've learned a
publish/subscribe methodology, where point A publishes a Message to an Exchange.
Point B subscribes to a Queue and binds that Queue to one or more Exchanges. The
Exchange receives a Message and sends it to all Queues subscribed to that
Exchange (fanout model). If multiple clients are subscribed to the same Queue,
then only one of them gets the message. But if multiple clients are subscribed
to different Queues, which are bound to the same Exchange, then all of them get
the Message.

Thus, in the code below, we must

1. Open a connection to the bus;
1. Create or connect to an exchange;
1. Subscribe to a queue;
1. Handle messages received through that queue.

Note that the nested functions are closures / callbacks - when one action
completes, it calls the next action. This is part of the asynchronous nature of
Node.js. Using a closure (which is just an anonymous method in .Net terms) as a
callback guarantees that the method runs after the call completes. However, I
ran into a problem that I haven't figured out yet (nor did I try hard &mdash;
since I don't need to be an expert). Originally I had a callback when opening
the exchange; the connection to the queue was in that callback. If the exchange
and queue already exist then this code works. But when the exchange is being
created for the first time, the callback is never executed. When I pulled the
queue creation into the next line after the exchange, instead of nested in a
callback, everything worked &mdash; as you can see in the RabbitMQ message
displayed below the code.

```javascript
var mqUrl = process.env.RABBITMQ_URL || "amqp://localhost";
var exchangeName = process.env.EXCHANGE || "RabbitMQ_web_api_testing";
var queueName = process.env.QUEUE || "apitest_webapi_simple";

console.log('Opening connection to RabbitMQ');
var connection = amqp.createConnection({ url: mqUrl }, {
    reconnect: true, // Enable reconnection
    reconnectBackoffStrategy: 'linear',
    reconnectBackoffTime: 1000, // Try reconnect once a second
});


connection.on('ready', function() {
    console.log('Creating/opening exchange: ', exchangeName);
    var exchange = connection.exchange(exchangeName);

    console.log('Creating/opening queue: ', queueName);
    connection.queue(queueName, function(queue) {

        console.log('Binding queue to exchange');
        queue.bind(exchange, queue.name);

        console.log('Publishing message');

        var publishMessage = {
            body: message
        };

        exchange.publish(queue.name, publishMessage);

        console.log('Done');
    });
});
```

And here's the message that is sitting in the **apitest_webapi_simple** queue in
RabbitMQ:

<table>
  <tr>
    <th align="left" width="150">Exchange</th>
    <td>RabbitMQ_web_api_testing</td>
  </tr>
  <tr>
    <th align="left">Routing Key</th>
    <td>apitest_webapi_simple</td>
  </tr>
  <tr>
    <th align="left">Redelivered</th>
    <td>&SmallCircle;</td>
  </tr>
  <tr>
    <th align="left">Properties</th>
    <td>
      <table class="mini">
        <tbody>
          <tr>
            <th>content_type:</th>
            <td>application/json</td>
          </tr>
        </tbody>
      </table>
    </td>
  </tr>
  <tr>
    <th align="left">Payload
    <sub>38 bytes</sub>
    <sub>Encoding: string</sub></th>
    <td>
      <pre>
{"body":"one+small+step+for+a+man..."}
    </td>
  </tr>
</table>

My automated test fails, but at least I've established communication with the
bus. The next post will look at the equivalent code for Web API.
