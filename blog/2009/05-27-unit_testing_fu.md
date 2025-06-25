---
title: Unit Testing Functions That Call Microsoft Enterprise Logging
date: '2009-05-27 21:53:23 -0500'
tags:
- tech
- dotnet
- testing
---

## Problem

you have a method that logs a message using the Microsoft Patterns &amp;
Practices Enterprise Library Logging Block, and you would like to write an automated unit
test for it in NUnit (or Team System &mdash; solution is easily adapted). Logging to a flat file
doesn't work; the file is still open when you try to read it to verify that the message has
been logged. Logging to the database doesn't work; it seems the log isn't written to the
database immediately. And so forth. Is there an in-memory way of reading the logged message?

<!-- truncate -->

## Solution

I wanted to create a Mock or Spy TraceListener, but didn't have the time to
work on this. Thus I gave up on it for a while. Then I remembered that the Enterprise Library
downloaded included unit tests of the library itself. Surely Microsoft already solved the
problem for me? Indeed, they have already created a `MockTraceListener` class.

## Setting up your test

1. Build the test NUnit testing project.
1. In your project, add a reference to the newly-compiled Microsoft.Practices.EnterpriseLibrary.Logging.Tests.dll, and add a proper using statement in your test class.
1. In the TestFixtureSetup and TestFixtureTearDown, call `MockTraceListener.Reset()` to clear the log.
1. Exercise your system under test
1. Check to make sure there is an entry in the MockTraceListener: `Assert.IsNotNull(MockTraceListener.LastEntry, "No log entry has been created");`
1. Check the contents of the `MockTraceListener.LastEntry.Message` to see if the specified message has actually been logged

## Setting up the config file

As with any other TraceListener, you must specify this MockTracelistener in the NUnit
project's config file:

* In the `<listeners>` section add:

  ```xml
   <add name="sharedMockListener"  type="Microsoft.Practices.EnterpriseLibrary.Logging.TraceListeners.Tests.MockTraceListener, Microsoft.Practices.EnterpriseLibrary.Logging.Tests" listenerDataType="Microsoft.Practices.EnterpriseLibrary.Logging.Tests.TraceListeners.MockTraceListenerData, Microsoft.Practices.EnterpriseLibrary.Logging.Tests" />
  ```

* In the `<specialSources>` section, add:

  ```xml
  <allEvents switchValue="All" name="All Events">
    <listeners>
      <add name="sharedMockListener" />
    </listeners>
  </allEvents>
  ```
