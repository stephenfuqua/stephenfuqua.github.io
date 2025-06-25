---
title: Notes on Configuring CruiseControl.Net
date: '2011-12-17 22:50:23 -0600'
tags:
- tech
- dotnet
- programming
- devops
---

Recently I began carving out some time for using CruiseControl.Net in earnest.
The book [Continuous Integration in
.Net](https://www.manning.com/books/continuous-integration-in-dot-net) was, and
I'm sure will continue to be, of great help. Nevertheless, I think it will
behoove my own memory, and perhaps help a few others, to record some notes on a
few practical details.

<!-- truncate -->

### AccuRev Integration

Integration with the source control tool AccuRev is very easy, as I'm sure is
the case with other SCMs. The only problem is redundancy &mdash; and a plain
text password. Each configured project needs to have a `<sourcecontrol
type="accurev">` block within it, containing the path to the executable,
login information, and workspace, and other settings.

Even if there are multiple projects in the same Stream, each project must repeat
that information. And due to that plain text password, it is best to use Windows
security to restrict editing of the configuration file to only those who
absolutely must have it. Presumably all developers in a group will have an
AccuRev account; however, one of the advantages of separate accounts is the
ability to track who uploaded what. How will you know if someone maliciously
slips some code in using the "shared" account?

### Publishers

The `<xmllogger />` element is crucial for viewing detailed build results. Never go without it.

The `<email>` element will allow distribution of alerts to groups of e-mail
recipients. This is a powerful feature. How do you decide who to include? Now
that I have over a dozen projects configured, I will let it run for at least a
week before introducing anyone else into the distributions. That way I can make
sure I don't accidentally spam them. No need to receive notifications for
every-day good builds. Just send out Failed and Fixed notifications. Be sure to
get the nested `<groups> <group>` right &mdash; I accidentally left out the top
level at first and scratched my head for a minute when the file wouldn't
validate, though the mistake wasn't that hard to find.

Again, you have to enter the same configuration over and over again for each
project. Unless there's something I haven't learned yet, such as the
introduction of a variable.

### webURL

Initially I tried to configure MyProject with URL
`http://myserver/ccnet/MyProject`. That didn't work so well. What does work is
`http://MyServer/ccnet/server/local/project/MyProject/ViewProjectReport.aspx`.

### Custom Project Files

Undoubtedly there is a better way to do this. But, in the tradition of red,
green, refactor &mdash; in several cases I made custom csproj files that
hard-coded reference links to other custom assemblies. Some of the projects were
building just fine and some weren't. This definitely solved it. Now I'm at
green. Later perhaps I'll try to figure out exactly why the original project
file failed and try to refactor. For now, this is good enough.

Actually, here's one more advantage of a custom project file: you can add extra
steps that you don't want to run every time you build locally. For example,
generating XML documentation and then running SandCastle.

### Unit Tests

So far I have ignored unit tests in my configuration, because my unit tests tend
to include a lot of database-related code. There is extensive use of mocking
(via Moles) so that non-database code does not call the database, but the
database code of course still does. It runs on a UnitTest database on each
developer's local machine. Unless I build an automatic deployment/install system
for database code changes, it would be impractical to create a UnitTest database
that can be accessed by the build server.

Therefore I plan to separate those tests into a different test project. The
original project will now be more purely "unit tests" (as opposed to integration
tests) and can be run with the project build. I could probably do more to
separate the tests: for instance, try to inject a fake stored procedure response
in order to test mapping code. But is that ultimately worth the extra effort?
Not sure yet. It is already a bit of a shock for customers to get
higher-than-expected estimates due to the extra time unit testing (though most
do understand that this typically will result in higher-quality code from day
1).

### Next Steps

I need to integrate FxCop and StyleCop for code analysis. We have written
standards for code quality. Might as well automate the process of checking on
adherence. SandCastle integration would also be nice &mdash; particularly if I
can set it up to automatically deploy the generated documentation to a web
directory on the build server.
