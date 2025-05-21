---
layout: page
title: Using Custom Types in Project Settings
date: '2012-09-06 20:57:04 -0500'
basename: using_custom_types_in_project_settings
tags:
- tech
- programming
- dotnet
excerpt_separator: <!--more-->
---

**Problem:** using <a
href="http://msdn.microsoft.com/en-us/library/k4s6c3a0.aspx">Application
Settings</a> in a .Net project, you find that there are so many entries that
some organization is needed.

**Solution:** create custom, serializable data types for logical groups of
settings.

<!--more-->

## 1. Custom Types

Create one or more <acronym title="Plain Old C(sharp) Object">POCO</acronym> for
logical groupings of your settings. Add the `[Serializable]` attribute from the
`System.Xml` namespace because the object data need to be stored as XML in the
settings file. It may be convenient to put a few other properties or methods
into the class, returning calculated values based on the settings &mdash; for
example, to parse a `TimeSpan` from a string in the settings. For those, you can
add the `[XmlIgnore]` attribute from the `System.Xml.Serialization` namespace.

## 2. Create XML for Your Type

In step 4 you'll need the serialized XML string, with default values, for your
custom type(s). Two ways of getting this: write a few lines of code to take care
of it for you, or you could always construct it manually using the XML below as
a template. Let's use this type to work the example:

```csharp
public class MySettingsType
{
    public string SettingString { get; set; }
    public int SettingInt { get; set; }
    public string[] SettingStringArray { get; set; }
}
```

Now, to write a few lines of code&hellip; I put this into a unit test class so
that I could easily execute it from within Visual Studio. 

```csharp
using System.Xml.Serialization;
using System.IO;

...

[TestMethod]
public void WriteSettingsXml()
{
	var settings = new MySettingsType
	{
		SettingInt = 4345,
		SettingBool = true,
		SettingStringArray = new string[] { "a", "b"}
	};

	var serializer = new XmlSerializer(typeof(MySettingsType));
	using (var writer = new StreamWriter(@"c:\temp\settings.xml"))
	{
		serializer.Serialize(writer, settings);
	}
}
```

And with this example in hand, it should be easy enough to write build your XML
by hand:

```xml
<?xml version="1.0" encoding="utf-8"?>
<MySettingsType xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <SettingBool>true</SettingBool>
  <SettingInt>4345</SettingInt>
  <SettingStringArray>
    <string>a</string>
    <string>b</string>
  </SettingStringArray>
</MySettingsType>
```

## 3. Open the Settings File

In Visual Studio, open the Settings File. Add a new Setting entry with an appropriate name for the collection of fields in your type. For Type, select Browse. This will open a dialog box _and you might not find your custom type in the list_ (I've seen the behavior go both ways, and not exactly sure why). If you don't see it, just type the namespace and class name into the textbox and click OK. Choose the scope you want. Finally, copy your XML and paste it into the Value field &mdash; the whole thing, starting with the XML version. Compile. Now your new property will be available in `Properties.Settings.Default`.

## End result

Imagine this with several custom types, providing organization to the project. Now imagine this in a class library that is used by several applications &mdash; if you want the defaults, just leave out a whole class worth of values.

```xml
<applicationSettings>
    <MyApp.Properties.Settings>
        <setting name="Setting" serializeAs="String">
            <value>mySampleValue</value>
        </setting>
        <setting name="Setting1" serializeAs="String">
            <value>AnotherValue</value>
        </setting>
        <setting name="Setting2" serializeAs="Xml">
            <value>
                <MySettingsType xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                    xmlns:xsd="http://www.w3.org/2001/XMLSchema">
                    <SettingBool>true</SettingBool>
                    <SettingInt>4345</SettingInt>
                    <SettingStringArray>
                        <string>a</string>
                        <string>b</string>
                    </SettingStringArray>
                </MySettingsType>
            </value>
        </setting>
    </MyApp.Properties.Settings>
</applicationSettings>
```
