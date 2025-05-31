---
title: Using QUnit and SinonJS for JavaScript Testing
date: 2014-05-31
slug: using_qunit_and_sinonjs_for_javascript_testing
tags:
- tech
- programming
- javascript

---

<div class="image">
![QUnit + SinonJS logos](/img/qunitPlusSinonJs.png)
</div>

Basic was the first language I learned. Well, partially, in 8th grade. On Apple
IIe at school and a Packard Bell 386 PC at home. A few years later, JavaScript
came out and it became the first "modern" language I used. As an undergraduate
physics major, I found it useful for quickly generating sample data or running
some numerical approximations (simpler than Mathematica). Then I wrote a few web
minor pages with DOM manipulation, before any of the modern frameworks had come
out. I went to work, used it occasionally, but never had any excuses in work or
home life to do more than dabble. The revolution was passing me by.

<!-- truncate -->

But with a change in employment came an opportunity &mdash; in fact the
necessity &mdash; of digging in deeper. That was no accident. But as a test
driven developer, I quickly realized that I was building up technical debt
in the form of untested code. I don't accept that in the C# I write, so why
accept that in JavaScript?

Thankfully plenty of others agree and some smart developers have provided the
necessary tools. Somewhat arbitrarily, I've decided to focus my efforts on
learning to test with [QUnit](httsp://qunitjs.com/) as my test runner
and [SinonJS](https://sinonjs.org/) as a mocking framework. Although I
like [jQuery UI](https://www.jqueryui.com) well enough, I generally
like the widgets in [Kendo UI](https://www.telerik.com/kendo-ui)
better ([comparison](https://jqueryuivskendoui.com/)). So, with those
tools chosen, let's demonstrate a simple unit test on a function that opens a
dialog box using [Kendo Window](https://demos.telerik.com/kendo-ui/window/index).

Confession: this is not proper <abbr title="Test Driven
Development">TDD</abbr>. I don't know the frameworks well enough to work in a
TDD mode. I had to start with understanding Kendo before I could write a test.
Here's a function for converting a div with ID "message" into a Kendo Window:

```javascript
function displayMessage(message, title) {
    // Setup the KendoWindow as a dialog box
    var dialog = $("#message").kendoWindow({
        width: "300px",
        height: "200px",
        title: title,
        modal: true,
        visible: false,
        actions: ["Close"]
    });
    // Inject the message argument into the window
    $("#message").html(message);
    // Center and open the window
    dialog.data("kendoWindow")
            .center()
            .open();
}
```

This is so straightforward that it hardly seems worth unit testing. But learning requires simple examples, right? And
with the test in place, I can feel more confident about extending and/or refactoring the code in the future. The first
step is to setup the test runner. If I weren't writing this for a blog post, then I would put this test runner
in a file called "tests.html" (for example), the system under test in an external javascript file, and the
tests in a second javascript file. Note that the `qunit` and `qunit-fixture` divs are the only critical ones.

```xml
<h1 id="qunit-header">QUnit Test Results</h1>
<h2 id="qunit-banner"></h2>
<div id="qunit-testrunner-toolbar"></div>
<h2 id="qunit-userAgent"></h2>
<div id="qunit"></div>
<div id="qunit-fixture"></div>
```

If using the QUnit for MVC NuGet package in Visual Studio, then you'll want to
replace `qunit` and `qunit-fixture` with `<ol id="qunit-tests"></ol>`. Next
we'll create a test fixture ("module" in QUnit terms) and a few global
variables. This article will only demonstrate one test, and thus the fixture is
not strictly necessary. But let's use it just for completeness.

Although I'm normally a fan of mocks over other types of fake objects, I found
that creating mocks on Kendo objects is just not worth it &mdash; they require
far too much effort to setup method chaining and the .data() command. Spies, on
the other hand, allow us to simply ask if particular methods were actually
called, and then inspect their arguments. They don't throw an error if the
system under test calls some unexpected funtionality, as a Mock would, but I
think I'm ok with that.

```javascript
// A few variables that will help us setup the tests
var sandbox; // this will be a SinonJS sandbox - a container for mocks, stubs, and spies.
var kendoWindowSpy // this will be a spy for the KendoWindow;
var jQueryHtmlSpy // and this will become a spy for changing the HTML inside the window;

// Prepare a QUnit module for testing - this is the test fixture
module("displayMessage tests",
{
    setup: function () {
        // The sandbox allows the spies to be temporary, with restoration of normal
        // functionality ater the test finishes runing
        sandbox = sinon.sandbox.create();

        // Create a spy for the two major pieces of functionality
        jQueryHtmlSpy = sandbox.spy(jQuery.fn, "html");
        kendoWindowSpy = sandbox.spy(jQuery.fn, "kendoWindow");
    },
    teardown: function () {
        // Restore the actual jQuery/Kendo functionality by clearing the sandbox
        sandbox.restore();

        // Using the spy, the dialog box will actually open. Re-close it.
        $("#message").data("kendoWindow").close();
    }
});
```

And finally the payoff &mdash; a test:

```javascript
test("displayMessage opens a Kendo window and replaces the inner contents", function () {
    // ** Prepare input **
    var title = "some title";
    var message = "<p>The detailed message</p><p>with HTML in it</p>";

    // ** Call the system under test  **
    // That is, call the function "displayMessage"
    displayMessage(message, title);

    // ** Evaluate the results **
    // Were the spies used?
    ok(jQueryHtmlSpy.calledOnce, "HTML should be injected");
    ok(kendoWindowSpy.calledOnce, "dialog window should be opened");

    // Now let's dig into the details a bit... first making sure the desired message was injected
    ok(jQueryHtmlSpy.calledWithExactly(message), "desired message not passed");

    // Next, let's look at the arguments passed to the KendoWindow. I don't want to
    // look at all the arguments - that would feel like overspecification to me.
    // So let's just test that the JSON-formatted arguments include the modal setting
    // and that the input title is injected as desired.
    var args = kendoWindowSpy.firstCall.args[0];

    ok(args.modal, "modal property");
    equal(args.title, title, "title property");
});
```

Put it all together and load it into JSFiddle&hellip;

<!-- todo -->

<iframe width="100%" height="300" src="http://jsfiddle.net/sfuqua/F3Uw4/embedded/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

Was it worth it? Maybe not in this specific example, but at work I had a more
complex situation, combining a couple of different Kendo widgets. **And the test
actually exposed a bug. Win.** It took embarrassingly long to come up with this
simple test, due to my long detour through trying to use SinonJS mocks. I think
I'll stay aware from them. As a next step, I might try out the suggestions in [Using
QUnit and Require.js to build modular unit tests](https://www.nathandavison.com/article/17/using-qunit-and-requirejs-to-build-modular-unit-tests) (dead link removed; SF 2025). In addition to the QUnit
and SinonJS documentation linked above, I want to give a shout-out to these
articles:

* [Unit Test Like a Secret Agent with Sinon JS](https://www.elijahmanor.com/unit-test-like-a-secret-agent-with-sinon-js/) (dead link removed; SF 2025)
* [Unit Testing JavaScript/JQuery in ASP.Net MVC Project using QUnit Step by Step](https://blogs.msdn.com/b/pranab/archive/2013/06/20/unit-testing-javascript-jquery-in-asp-net-mvc-project-using-qunit.aspx) (dead link removed; SF 2025)
