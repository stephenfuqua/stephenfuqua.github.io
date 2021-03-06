---
layout: page
title: Validating XML Via Embedded XSD Schema
date: '2008-01-17 15:30:14 -0600'
basename: validating_xml
tags:
- tech
- dotnet
excerpt_separator: <!--more-->
---

**Problem:** You have some XML, and you need to validate it against a custom
schema that you want to deploy with your .Net 2.0 assemblies. Issues addressed:
opening the file and handling the schema validation.

**Solution:** The `XmlSchema` class contains a <a
href="http://msdn2.microsoft.com/en-us/library/system.xml.schema.xmlschema.read.aspx">Read</a>
method that takes a stream as a parameter. Nicely matching up to that, you can
open a stream from an embedded resource (<a
href="http://www.attilan.com/2006/08/accessing_embedded_resources_u.php">thank
you, attilan.com</a>).So, embed the schema. In Visual Studio's Solution
Explorer, right-click the schema file and choose properties. Change the Build
Action to "Embedded Resource".

<!--more-->

### Open the Embedded Resource Stream

The first thing to establish is the name of your embedded resource. For the
Assembly that it is stored in, the name will be the Assembly's namespace to
begin with. If the resource is in a sub-directory, add that directory's name.
Then add the filename that is being embedded. Thus if you have an assembly
called `MyCode.exe`, a directory called Resources, and an embedded schema file
called `MySchema.xsd`, then the resource name will be
`MyCode.Resources.MySchema.xsd`. I think; I haven't found good documentation to
back that up, but it should be something to that effect.

Now you need to execute <a
href="http://msdn2.microsoft.com/en-us/library/system.reflection.assembly.getmanifestresourcestream.aspx">`GetManifestResourceStream(string)`</a>
on an Assembly. Which Assembly? Assuming it is the same Assembly where your code
is written, you can use `System.Reflection` to find the "executing" Assembly:
`myStream =
Assembly.GetExecutingAssembly().GetManifestResourceStream(myResourceName);`.

### Creating the Schema and Validating

Creating the schema is simple: `XmlSchema mySchema = XmlSchema.Read(myStream,
new ValidationEventHandler(myDelegateHandler));`. This <a
href="ValidationEventHandler">ValidationEventHandler</a> is a delegate that
handles any validation errors. Simply create a delegate method somewhere with a
signature of `void myHandler(object sender, ValidationEventArgs e)`. In that
method you'll have to decide what to do with the validation errors. There are
two <a
href="http://msdn2.microsoft.com/en-us/library/system.xml.schema.xmlseveritytype.aspx">severities</a>
(Error and Warning), and the `ValidationEventArgs` contains the detailed
validation problem. In my case, I threw the problem into a custom exception
class so that it could be handled downstream.

Finally, you'll need to load the schema into an <a
href="http://msdn2.microsoft.com/en-us/library/system.xml.xmldocument.aspx">XmlDocument</a>
via <a
href="http://msdn2.microsoft.com/en-us/library/system.xml.xmldocument_members.aspx">`Shemas.Add(XmlSchema)`</a>,
and then run the `Validate()` method on that object, again passing the
validation delegate as an argument.
