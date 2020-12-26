---
layout: page
title: 'Notes on WCF in Business Applications, Part 1: Server Side'
date: '2014-02-02'
basename: notes_on_wcf_in_business_applications_part_1_server_side
tags:
- tech
- programming
- dotnet
excerpt_separator: <!--more-->
---
   
<a
href="http://msdn.microsoft.com/en-us/library/ms731082%28v=vs.110%29.aspx">Windows
Communication Foundation</a> (WCF) is a great tool for building client/server
applications in the .Net environment. It is one of those technologies that can
be challenging to dig into when services are just one of many tools needed to
assemble a business application, as opposed to being an end in itself. With
some of my co-workers in mind, here are some of the lessons I have learned in
using WCF for internal, line-of-business, applications. These notes, which
will be published in several parts, assume a basic understanding of WCF and
contracts.

<!--more-->

## Self-Hosting

WCF is the .Net component for "web services;" naturally the default mechanism of
hosting a service is through the web server. While this can be easy to install,
it does require that you can install and configure IIS on the server machine. If
you have no other needs for a web server, or want the advantages of bindings
other than HTTP, then <a href=
"http://msdn.microsoft.com/en-us/library/ms731758%28v=vs.110%29.aspx">self-hosting</a>
is a better option.

In this model, the developer typically builds a <a href=
"http://msdn.microsoft.com/en-us/library/d56de412%28v=vs.110%29.aspx">Windows
service</a> that provides the host. Client applications connect to a URL just as
they do for a "hosted" (IIS) solution. The Windows service must create an
instance of the <a href=
"http://msdn.microsoft.com/en-us/library/ms734686%28v=vs.110%29.aspx">ServiceContract
class</a>, and inject that into a <a href=
"http://msdn.microsoft.com/en-us/library/system.servicemodel.servicehost%28v=vs.110%29.aspx">ServiceHost</a>.
The following code assumes that the service's <a href=
"http://msdn.microsoft.com/en-us/library/ms733932%28v=vs.110%29.aspx">endpoint
(URL), binding, and behavior</a> are setup in the application's config file (<a
href="#noteConfig" class= "noteLink">note</a>).

{: .panel .panel-info}
<a id="noteConfig"></a>If you used the Windows Service template when creating
the project in Visual Studio, then you'll need to manually add the endpoint,
binding, and behavior to the application's config file, whereas they will be
present by default if you used the WCF template. Alternately, you can right
click the app.config file in Solution Explorer, and choose **Edit WCF
Configuration**. This will load the config file into a helpful editor.

{: .text-center}
![UML Diagram](/images/wcfUml.png)

  ```csharp
public partial class MyService : ServiceBase
{
   // be sure to close this in the Dispose() method, which will be in the MyService.Designer.cs file   
   protected ServiceHost ServiceHost { get; set; }

   public MyService()
   {
      InitializeComponent();
   }

   protected override void OnStart(string[] args)
   {
      ServiceHost = new ServiceHost(typeof(MyService));
      ServiceHost.Open();
   }

   protected override void OnStop()
   {
      closeService();
   }

   private void closeService()
   {
      if (ServiceHost != null)
      {
         if (ServiceHost.State == (CommunicationState.Opened ^ CommunicationState.Opening))
         {
            ServiceHost.Close();
         }
      }
   }
}
```

## Threaded Startup

When Windows starts up a service, it only gives 30 seconds to the service's
OnStart command. This is a synchronous method, and if no response is received in
that window, then the service times out. There is a method on the
**ServiceBase**, <a href=
"http://msdn.microsoft.com/en-us/library/system.serviceprocess.servicebase.requestadditionaltime%28v=vs.110%29.aspx">
RequestAdditionalTime</a>, that can be used to extend beyond that timeout
&#8211; but the timeout is there for a reason. Assuming that your service starts
when the server starts, it is best to let the OS get on with the business of
starting up without having to sit around waiting for your service to finish
_starting_.

Therefore, start the service via a thread. Don't **Wait()** for the thread to
complete; just let it do its own thing. I like to use the <a href=
"http://msdn.microsoft.com/en-us/library/dd460717%28v=vs.110%29.aspx">Task
Parallel Library</a> instead of the Thread class.

  ```csharp
protected object threadLock = new object();

protected override void OnStart(string[] args)
{
   Task.Run(() =>
      {
         lock (threadLock)
         {
            ServiceHost = new ServiceHost(typeof(MyService));
            ServiceHost.Open();
         }
      });
}
```

## Development Debugging
  
Windows services are difficult to debug; you can't start the Service from Visual
Studio using the "Start Debugging" command. The simplest way to debug a WCF
service is to run it in a console instead of as a service. When using the
default Visual Studio template for a Windows Service Application, you get a
**Main()** function like this:

```csharp
static void Main()
{
   ServiceBase[] ServicesToRun;
   ServicesToRun = new ServiceBase[]
   { 
      new MyService()
   };
   ServiceBase.Run(ServicesToRun);
}
```

Use <a href="http://msdn.microsoft.com/en-us/library/ed8yd1ha.aspx">compiler
directives</a> to change this so that the program runs as a stand-alone
application from Visual Studio when in Debug mode, but remains a Windows service
when compiled in Release mode. Refactor the **OnStart** method so that it calls
a public **Start** method, which itself can be called from the static **Main()**
method. I will also clean up that default code a little bit&#8230;

  ```csharp
        var myService = new MyService();
#if DEBUG
        myService.Start();
        Console.WriteLine("Press any key to close down the service");
        Console.Read();
#else
        ServiceBase[] ServicesToRun = new ServiceBase[] { myService };
        ServiceBase.Run(ServicesToRun);
#endif
```

## Installing the Service

There are two ways to install the service:

<ol>
  <li>Add an Installer class per the instructions in <a href=
  "http://msdn.microsoft.com/en-us/library/zt39148a%28v=vs.110%29.aspx">Walkthrough: Creating a
  Windows Service Application in the Component Designer</a>, or</li>

  <li>Build an MSI using the <a href="http://wixtoolset.org/">WiX Toolset</a> (StackOverflow post
  on <a href=
  "http://stackoverflow.com/questions/1942039/how-to-install-and-start-a-windows-service-using-wix">
  Installing a service using WiX</a>)</li>
</ol>
  
The first option is simple and therefore inappropriate in many cases. Building
an MSI allows you to

<ul>
  <li>Bundle dependent DLL's together to make sure nothing is left out;</li>

  <li>Avoid asking someone to pull up a command-prompt and get the right .Net Framework path for
  InstallUtil.exe;</li>

  <li>Prompt the installer to enter a service account name and password, instead of making them
  open the Service Manager and manually enter those values as an additional step (<a href=
  "#noteService" class="noteLink">note</a>);</li>

  <li>Perhaps provide options, such as installing with a Test-environment config file instead of
  the default config file geared toward the Production environment.</li>
</ul>

{: .panel .panel-info}
<a id="noteService"></a>By default, the service would
otherwise install using the "LOCAL SERVICE" account, which is built into Windows. But
this does not provide a satisfactory level of control for a service that needs to access
resources, such as files or a database. In that case, it is best to create a dedicated domain
account. Grant that account permission to access necessary files and to execute stored procedures
or perform CRUD operations directly on tables.


None of these advantages are strictly necessary; you could do them all manually.
But manual steps are prone to error and frustration. So building an MSI package
is a manifestation of the <a href="/archive/2013/11/tackle-be-kind.html">Be
Kind</a> admonition from my unfinished TACKLE theory of software development.

## Run-time Debugging

As with any other application, presumably the service also has some logging
mechanism built in. But sometimes the basic logging is not enough &#8212; you'll
need to know if applications are actually managing to call the service, the
order of operation calls, and which calls generated errors / faults. It is
trivial to enable logging a substantial amount of event log data; in fact, it is
very easy to accidentally log an overwhelming amount of data.

This logging is configured via the <a href=
"http://msdn.microsoft.com/en-us/library/ms751526%28v=vs.100%29.aspx">system.diagnostics</a>
node in the application's config file. The default configuration provided by
Microsoft includes two types of events: Information and ActivityTracing. I find
that "Information" provides far too much data, unless perhaps I am tuning for
performance. As a commenter in the link above notes, be sure that the account
running your service has write access to the directory that you configure for
the log file. For error debugging, turn on the Warning, Error, and Critical
switches. Again, this is configurable via the Microsoft Service Configuration
Editor; however, it only allows you to configure one switch for the trace
source, so I had to manually add the **,Error,Critical**. If that is still too
much information, turn off Warnings and ActivityTracing. The generated file can
be opened by the developer using the <a href=
"http://msdn.microsoft.com/en-us/library/ms732023%28v=vs.100%29.aspx">Service
Trace Viewer Tool</a>.

```xml
<system.diagnostics>
    <sources>
          <source propagateActivity="true" name="System.ServiceModel" switchValue="Warning,Error,Critical,ActivityTracing">
                <listeners>
                      <add type="System.Diagnostics.DefaultTraceListener" name="Default">
                          <filter type="" />
                      </add>
                </listeners>
          </source>
    </sources>
    <sharedListeners>
          <add initializeData="C:\Logs\MyService.svclog" type="System.Diagnostics.XmlWriterTraceListener, System, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089"
                name="NewListener" traceOutputOptions="LogicalOperationStack, DateTime, Timestamp, ProcessId, ThreadId, Callstack">
              <filter type="" />
          </add>
    </sharedListeners>
</system.diagnostics>
```

Logging takes a bit of a toll on performance, so I recommend commenting out this
whole section of the config file unless and until you need it. Since this is a
Windows service, don't forget to stop and re-start the service after making a
change to the installed config file.

## Preview of the Next Parts

In two follow-ups to this note, I plan to discuss:

<ol>
  <li>Shared Concerns

    <ul>
      <li>Security</li>

      <li>Binding</li>

      <li>Faults and Exceptions</li>

      <li>Dependency Injection</li>

      <li>Shared Library</li>
    </ul>
  </li>

  <li>Client Side

    <ul>
      <li>Custom Service Client / Proxy</li>

      <li>Channel Caching</li>

      <li>Using Statement</li>

      <li>General References</li>
    </ul>
  </li>
</ol>

## Comments

_Comments manually imported from old blog_

> author: shivam282<br>
> date: '2014-02-03 09:08:07 -0600'
>
> Thanks. It's Good Stuff, waiting for next parts.
