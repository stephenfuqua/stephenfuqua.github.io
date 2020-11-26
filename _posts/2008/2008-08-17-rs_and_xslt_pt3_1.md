---
layout: post
title: 'RS and XSLT, pt3.2: Using XSLT for Custom Reporting Services Output'
date: '2008-08-17 21:40:36 -0500'
basename: rs_and_xslt_pt3_1
tags:
- tech
- database
- sql-server
---

In the third installment of a series, we defined some intended flat file output, designed 
a simple report in MSSQL Reporting Services, and looked at the plain XML output 
from Reporting Services. Now, long after that post, we can create and apply the 
XLST needed to convert that report to the desired output.

<!--more-->

Here's the raw XML output again:

```xml
<?xml version="1.0" encoding="utf-8"?>
<Report p1:schemaLocation="RsXsltDemo
http://reportserver?/RsXsltDemo&rs%3aFormat=XML&rc%3aSchema=True" Name="RsXsltDemo" 
executeTimeStamp="2008-02-28T14:49:23.7940175"
textbox2="3" 
xmlns:p1="http://www.w3.org/2001/XMLSchema-instance"
xmlns="RsXsltDemo">
	<resultSet>
		<Detail_Collection>
			<Detail col1="r1c1" col2="r1c2" col3="r1c3" />
			<Detail col1="r2c1" col2="r2c2" col3="r2c3" />
			<Detail col1="r3c1" col2="r3c2" col3="r3c3" />
		</Detail_Collection>
	</resultSet>
</Report>
```

And here is the intended output, fixed up so that it consistently uses the 
pipe character instead of commas in the header and trailer:

```none
HEADER|MYREPORT|<datetime>
<col1 data>|<col2 data>|<col3 data>
<col1 data>|<col2 data>|<col3 data>
TRAILER|<row count>
```

Now let's build up the XSL needed to transform this.

## Startup

```xml
<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:rpt="RsXsltDemo">
  <xsl:output method="text" encoding="utf-8" media-type="text/plain" />
  <xsl:strip-space elements="*"/>
```

So, we have the standard start to an XML stylesheet, followed by a command to 
save the output as plain text in UTF-8 format, and a command to trim all data 
elements.

## Create a Template

```xml
<xsl:template match="Report">
  <xsl:text>HEADER|MYREPORT|</xsl:text>
  <xsl:value-of select="executeTimestamp"/>
  <xsl:text>&#xD;&#xA;</xsl:text>
  <xsl:for-each select="resultSet/Detail_Collection/Detail">
```

Taking this line-by-line:

<ol>
    <li value="5">Sets this template applicable to the <span class="command">
    Report</span> element in our source XML. </li>
    <li>Places static header into the output.</li>
    <li>Selects the timestamp value from the input and places it into the 
    output.</li>
    <li>Line break and carriage return (or is that carriage return and line 
    break?)</li>
    <li>Start a loop on all <span class="command">Detail </span>elements in
    <span class="command">Detail_Collection</span>.</li>
</ol>

## Format the Detail Lines

```xml
    <xsl:value-of select="@col1"/>
      <xsl:text>|</xsl:text>
      <xsl:value-of select="@col2"/>
      <xsl:text>|</xsl:text>
      <xsl:value-of select="@col3"/>
      <xsl:text>&#xD;&#xA;</xsl:text>
```

<ol>
    <li value="10">Insert the value from the column named <span style="command">col1</span></li>
    <li>Insert the pipe character</li>
    <li>Value from column named <span style="command">col2</span></li>
    <li>Pipe character</li>
    <li>Value from column named <span style="command">col3</span></li>
    <li>Carriage return and line break</li>
</ol>

## Finish Off the Template

```xml
    </xsl:for-each>
    <xsl:text>TRAILER|</xsl:text>
    <xsl:value-of select="rowCount"/>
  </xsl:template>
</xsl:stylesheet>
```

<ol>
    <li>Close out the loop</li>
    <li>Add the static trailer text</li>
    <li>Insert the row count from the input</li>
    <li>Close out the template</li>
    <li>Close out the stylesheet</li>
</ol>

## Applying the Template on Output of XML

In the Report Builder, Layout tab, open the report's properties box and 
switch to the Data Output tab. Add the name of the transform (full file name, 
including the XSL extension) Finally, preview the report and export as XML. Is 
your output what you hoped for?

In the next and final installment, we'll add the complexity of a fixed 
format.
