---
layout: post
title: 'SSIS: Updating Variables From Resultset Data'
date: '2008-01-29 09:56:08 -0600'
basename: ssis_updating_v
tags:
- tech
- database
- sql-server
- ssis
excerpt_separator: <!--more-->
---

**Problem:** In SSIS, you want to update a variable from a Script Component
embedded in a Data Transform task. You get an error message reading "the
collection of variables locked for read and write access is not available
outside of postexecute". What's up? <span class="mt-enclosure
mt-enclosure-image"><img alt="ssis resultset variables.jpg"
src="http://www.safnet.com/writing/tech/archives/2008/01/29/ssis%20resultset%20variables.jpg"
width="165" height="148" class="mt-image-center" style="text-align: center;
display: block; margin: 0 auto 20px;"/></span>

<!--more-->

**Solution:** <a
href="http://msdn2.microsoft.com/en-us/library/aa337079.aspx">Microsoft
explains</a>: "The collection of ReadWriteVariables is only available in the
PostExecute." OK, so what now? It turns out that this is really easy. In your
script, add a class-level variable. Make sure you instantiate it. In the
InputBuffer routine, update the class variable rather than the external package
variable. Then override the PostExecute method; in your override you assign the
class variable back to the package variable. Example:

```vb
Public Class ScriptMain
     Inherits UserComponent

     Dim msg As String = String.Empty

     Public Overrides Sub Input0_ProcessInputRow(ByVal Row As Input0Buffer)

          If msg.Equals(String.Empty) Then

               ' This is the first row, so need to start the message with something
               msg = "The following blah blah blah...."
               msg += Environment.NewLine + Environment.NewLine
               msg += "Number" + Environment.NewLine
               msg += "------" + Environment.NewLine

          End If

          ' Append new lines with each Row. "MyNumber" is the name of a column in a SQL query resultset
          msg += Row.MyNumber.ToString().PadLeft(8, " "c)
          msg += Environment.NewLine

     End Sub

     Public Overrides Sub PostExecute()

          Variables.ReportMessage = msg.ToString()

          MyBase.PostExecute()

     End Sub
End Class
```
