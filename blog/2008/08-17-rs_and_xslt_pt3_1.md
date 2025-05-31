---
title: 'RS and XSLT, pt3.2: Using XSLT for Custom Reporting Services Output'
date: '2008-08-17 21:40:36 -0500'
slug: rs_and_xslt_pt3_1
tags:
- tech
- database
- sql-server
---

In the third installment of a series, we defined some intended flat file output, designed
a simple report in MSSQL Reporting Services, and looked at the plain XML output
from Reporting Services. Now, long after that post, we can create and apply the
XLST needed to convert that report to the desired output.

<!-- truncate -->

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

1. Places static header into the output.
2. Selects the timestamp value from the input and places it into the output.
3. Line break and carriage return (or is that carriage return and line break?)
4. Start a loop on all `Detail` elements in `Detail_Collection`.

## Format the Detail Lines

```xml
    <xsl:value-of select="@col1"/>
      <xsl:text>|</xsl:text>
      <xsl:value-of select="@col2"/>
      <xsl:text>|</xsl:text>
      <xsl:value-of select="@col3"/>
      <xsl:text>&#xD;&#xA;</xsl:text>
```

1. Insert the pipe character
1. Value from column named `col2`
1. Pipe character
1. Value from column named `col3`
1. Carriage return and line break

## Finish Off the Template

```xml
    </xsl:for-each>
    <xsl:text>TRAILER|</xsl:text>
    <xsl:value-of select="rowCount"/>
  </xsl:template>
</xsl:stylesheet>
```

1. Close out the loop
1. Add the static trailer text
1. Insert the row count from the input
1. Close out the template
1. Close out the stylesheet

## Applying the Template on Output of XML

In the Report Builder, Layout tab, open the report's properties box and
switch to the Data Output tab. Add the name of the transform (full file name,
including the XSL extension) Finally, preview the report and export as XML. Is
your output what you hoped for?

In the next and final installment, we'll add the complexity of a fixed
format.
