---
layout: page
title: C# Extension Methods for IDataReader
date: '2010-01-18 17:29:11 -0600'
basename: c_extension_met
tags:
- tech
- dotnet
- programming
excerpt_separator: <!-- truncate -->
---

My team often starts Tuesday morning status meetings with a round of
win/learn/fun - a team-building exercise where each person gets to mention an
exciting "win", something they learned in the last week, or just something fun.
Several weeks ago someone brought up C# <a href=
"http://msdn.microsoft.com/en-us/library/bb383977.aspx">Extension Methods</a> as
a learn. I could see the potential, but I didn't immediately think of any
practical examples.

<!-- truncate -->

Fast forward: working on an application at home, and started the data layer. I
was reminded that I am annoyed the fact that [IDataReader](http://msdn.microsoft.com/en-us/library/system.data.idatareader.aspx)
does not have a `GetString(colName: string)` method (or other data types).
Instead, you must use `reader.GetString(reader.GetOrdinal(colName))`. And you
must watch out for null values. Suddenly struck me that this would be a good
candidate for an extension method. So I created the following:

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

Note that I have purposefully chosen to use empty strings instead of nulls,
because that is the appropriate response for this domain. I also chose to name
the function GetStringFromName because I prefer avoiding the confusion of having
the same name as a fundamental method on the interface. Finally, use the
function: add `using` directive for the namespace, and then `string colValue =
reader.GetStringFromName(colName);`. Now I just need to spend a few minutes
creating similar methods for the other data types. Optionally I could add in
custom error handling for situations where the column does not exist, or the
reader does not have any data, etc.
