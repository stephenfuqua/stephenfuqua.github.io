---
title: 'RS and XSLT, pt3.3: Using XSLT for Custom Reporting Services Output'
date: '2008-08-17 21:45:24 -0500'
slug: rs_and_xslt_pt3_2
tags:
- tech
- database
- sql-server
---

We recently returned to the discussion of using XML style transforms to format
flat file output from Reporting Services. The report we created was pretty
basic, so let's look at something more complex: a fixed format.

Let's say the client has given us the following file format, and we've trimmed
the data in the SQL query to make sure it doesn't exceed the data width:

<!-- truncate -->

| Record Type | Static Data | Dynamic Data  | Width |
| ----------- | ----------- | ------------- | ----- |
| Header      | 01          |               | 2     |
| Header      | MyReport    |               | 9     |
| Header      |             | Date and Time | 10    |
| Header      | 0x0D0x0A    |               | 2     |
| Detail      | 02          |               | 2     |
| Detail      |             | col1          | 9     |
| Detail      |             | col2          | 10    |
| Detail      |             | col3          | 15    |
| Detail      | 0x0D0x0A    |               | 2     |
| Trailer     | 03          |               | 2     |
| Trailer     |             | Row count     | 9     |

New problem for our XSL: need to dynamically pad a column to make sure that
it reaches the specified width.

## Introducing the Recursive Space Template

This is a cool function, add it to the template file:

```xml
<xsl:template name="Space">
  <xsl:param name="count" />
    <xsl:if test="$count">
      <xsl:value-of select="' '"/>
    <xsl:call-template name="Space">
      <xsl:with-param name="count" select="$count - 1" />
    </xsl:call-template>
  </xsl:if>
</xsl:template>
```

Line-by-line analysis:

1. Create an input parameter/variable called `count` (think of this like a function's argument)
2. Branch the template when the `count` variable has data (is greater than zero)
3. Add a space character
4. Call the template again, recursively
5. Set the input parameter to the current `count` minus one
6. Next three lines wrap things up.

## Variables for the Column Widths

```xml
<xsl:variable name="WidthCol1" select="9" />
<xsl:variable name="WidthCol2" select="10" />
<xsl:variable name="WidthCol3" select="15" />
```

## Calling the Space Template

```xml
<xsl:value-of select="@col1"/>
<xsl:call-template name="Space">
<xsl:with-param name="count" select="$WidthCol1 - string-length(@col1)" />
</xsl:call-template>
```

Analysis:

1. Call the Space template
1. Set the input parameter as the pre-defined column width for column1 minus the length of the data value
1. End the Space template call

## Putting It All Together

```xml
<?xml version="1.0"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:rpt="RsXsltDemo">
  <xsl:output method="text" encoding="utf-8" media-type="text/plain" />
  <xsl:strip-space elements="*"/>
  <xsl:template name="Space">
    <xsl:param name="count" />
    <xsl:if test="$count">
      <xsl:value-of select="' '"/>
      <xsl:call-template name="Space">
        <xsl:with-param name="count" select="$count - 1" />
      </xsl:call-template>
    </xsl:if>
  </xsl:template>
  <xsl:variable name="WidthCol1" select="9" />
  <xsl:variable name="WidthCol2" select="10" />
  <xsl:variable name="WidthCol3" select="15" />
  <xsl:template match="Report">
    <xsl:text>01MYREPORT </xsl:text>
    <xsl:value-of select="executeTimestamp"/>
    <xsl:call-template name="Space">
      <xsl:with-param name="count" select="$WidthCol1 - string-length(@executeTimestamp)" />
    </xsl:call-template>
    <xsl:text>&#xD;&#xA;</xsl:text>
    <xsl:for-each select="resultSet/Detail_Collection/Detail">
      <xsl:text>02</xsl:text>
      <xsl:value-of select="@col1"/>
      <xsl:call-template name="Space">
        <xsl:with-param name="count" select="$WidthCol1 - string-length(@col1)" />
      </xsl:call-template>
      <xsl:value-of select="@col2"/>
      <xsl:call-template name="Space">
        <xsl:with-param name="count" select="$WidthCol2 - string-length(@col2)" />
      </xsl:call-template>
      <xsl:value-of select="@col3"/>
      <xsl:call-template name="Space">
        <xsl:with-param name="count" select="$WidthCol3 - string-length(@col3)" />
      </xsl:call-template>
      <xsl:text>&#xD;&#xA;</xsl:text>
    </xsl:for-each>
    <xsl:text>03</xsl:text>
    <xsl:value-of select="rowCount"/>
    <xsl:call-template name="Space">
      <xsl:with-param name="count" select="$WidthCol2 - string-length(@rowCount)" />
    </xsl:call-template>
  </xsl:template>
</xsl:stylesheet>
```
