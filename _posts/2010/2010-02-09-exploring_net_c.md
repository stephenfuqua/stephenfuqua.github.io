---
layout: page
title: Exploring .Net Code with Pex
date: '2010-02-09 21:36:24 -0600'
basename: exploring_net_c
tags:
- tech
- dotnet
- unit-test
excerpt_separator: <!--more-->
---

A few weeks ago I stumbled upon a tool called <a
href="research.microsoft.com/en-us/projects/Pex">Pex</a> from the Microsoft
Research Labs: "Pex finds interesting input-output values of your methods, which
you can save as a small test suite with high code coverage." Not having much
time to spend exploring it, I was fortunate to have time to attend a <a
href="http://twincitiesdevelopersguild.com/">Twin Cities Developers Guild</a>
meeting tonight and hear a talk on on how to use the tool, which now has me jump
started. First a few highlights of what I learned (without cribbing too much
from <a href="http://www.jasonbock.net/">Jason Bock</a>'s presentation), and
then sample results from the <a
href="http://www.safnet.com/writing/tech/2010/01/c-extension-met.html">method in
my last post</a>.

<!--more-->

## Highlights

<ul>
<li>Must be patient with it - exploring .Net code takes some time</li>
<li>Doesn't replace regular unit testing; rather, it augments by helping find cases you might not have thought about.</li>
<li>Particularly useful for API and user applications where you don't know what data are coming in.</li>
<li>It is up to the user to interpret the results; a "failing" test (exception thrown) might be due to a design feature 
(throw MyException in some situation), and a "passing" test might expose a logical problem that is programmatically legit.</li>
<li>It comes with <a href="http://www.safnet.com/writing/tech/archives/2010/01/c_extension_met.html">ExtendedReflection</a>, 
which can be used for instrumentation/performance profiling.</li>
<li>It also comes with <a href="http://research.microsoft.com/en-us/projects/stubs/moles.aspx">Moles</a>, which creates "redirector"
methods that can be used while writing unit test &mdash; e.g. can create a mock method body on method A that injects a particular 
behavior, and then test method B that calls method A to see if B handles the behavior properly. There are other mock-ing
libraries out there, but this little one apparently goes farther than most by getting at static methods and sealed classes.</li>
</ul>

## Example

Here's the function I posted as an Extension Method recently:

```csharp
public static class IDataReaderExtensions
{
    public static string GetStringFromName(this IDataReader reader, string colName)
    {
        string value = string.Empty;
        if (!reader.IsDBNull(reader.GetOrdinal(colName)))
        {
            value = reader.GetString(reader.GetOrdinal(colName));
        }
        return value;
    }
}
```

Before I run this through, how about some self-criticism? Then we'll find out what Pex catches:
<ol>
<li>What if `reader` is closed?</li>
<li>What if `colName` is null, or empty?</li>
<li>What if `colName` does not exist in the reader, and therefore `GetOrdinal` throws 
`IndexOutOfRangeException`?</li>
</ol>

Pex is installed. I'm in Visual Studio 2008, and I right-click on `GetStringFromName` to run Pex. Code
build and Pex starts running. Response: "could not find any test to run.". I didn't expect that. In the demonstrations
I saw today, Mr. Bock simply did I stated above, and it worked. I have a warning: "no explorations found after 
applying all filters; did you forget a [PexClass] or [PexMethod] attribute?" Head back to the documentation&hellip; it
looks like I need to "Run Pex Explorations" first, but I'm not given that option in the context menu. However, 
I think "Run Pex" might be the same command as "Run Pex Explorations", so I'm not convinced that I did anything 
wrong. Click on "could not find any test to run," and I get a helpful window stating:

> This error occurs when Pex could not find an appropriate method to explore.
> Common reasons for this error are:
>
> <ul><li>The intended target method is not visible.</li>
> <li>The intended target method is not defined in a visible class.</li>
> <li>The intended target method is defined in an abstract class. </li>
> </ul>
>
> If you are running Pex on a method in a test project, please make sure that
> the target method has the attribute PexMethod, and that it is defined in a
> PexClass.

But none of those assertions are true: the class is not abstract, it is visible,
and so is the method. It is not in a test project. Maybe there's something odd
about the solution I was using (I had pasted the code into the most recent
solution on which I was working). OK, create a new Class Library project.
Nothing in it but my class &amp; method. Same result. And I've just done exactly
what is shown in the <a
href="http://research.microsoft.com/en-us/projects/pex/pexcodediggertutorial.pdf">Code
Digging With Pex</a> tutorial. Frustration.

<a
href="http://social.msdn.microsoft.com/Forums/en/pex/thread/c55e80fd-4e24-4590-878d-3c9a18e3c832">On
the MSDN forums</a> I find someone else getting this error and not knowing why.
One of the Pex team members replies "Pex cannot figure out an assignment of type
to instantiate... In order to workaround this, you need to first generated the
parameterized unit test...". Well, maybe the extension method is a bit
confusing. Let's try that. I'll accept all of the defaults when I create
parameterized unit test stubs. Adds a new unit test project, letting me choose
the unit testing framework (I prefer NUnit). Taking its sweet time. Now I'm
running Pex.

<p class="center">{Image files no longer available}</p>

Well, that's one of the expected failures anyway. I'll probably have to play around with the tests to create a real DataReader
in order to get any other results. In the Pex Explorer, there's yellow plus sign to "apply available fixes", and it
automatically plunks down the following <a href="http://c2.com/cgi/wiki/Wiki?GuardClause">guard clause</a>:

```csharp
// <pex>
if (reader == (IDataReader)null)
    throw new ArgumentNullException("reader");
// </pex>
```

Was that really helpful? We've just exchanged a NullReferenceException for an ArgumentNullException, and that is
<a href="http://blogs.msdn.com/brada/archive/2004/07/11/180315.aspx">a good practice</a>.

## Conclusion

Pex discovered a bug that I had seen in visual inspection and missed a few
others. But, this is a particularly case because of the IDataReader, and should
not be an indictment on the program. If I were code reviewing a large
application, it would be easy to overlook this particular error, in which case
Pex would be very handy. And, truth be told, I probably would have remained lazy
and not put in the ArgumentNullException. Pex made it easy, and now I'll keep
that clause (although I must add curly braces in order to maintain standards).
