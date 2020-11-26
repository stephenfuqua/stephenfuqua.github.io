---
layout: post
title: 'RS and XSLT, pt3.3: Using XSLT for Custom Reporting Services Output'
date: '2008-08-17 21:45:24 -0500'
basename: rs_and_xslt_pt3_2
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

<!--more-->

| Record Type | Static Data | Dynamic Data | Width |
| -- | -- | -- | -- |
| Header | 01 |  | 2 |
|Header |MyReport | |9 |
|Header |  |Date and Time|10 |
| Header | 0x0D0x0A | | 2 |
| | | |
|Detail |02 | |2 |
|Detail |  |col1 |9 |
|Detail | |col2 |10 |
|Detail |  |col3 |15 |
| Detail | 0x0D0x0A |  | 2 |
| | | |
|Trailer |03 |  |2   |
|Trailer |  |Row count   |9   |

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

<ol>
  <li value="5">Start the template</li>
  <li>Create an input parameter/variable <span class="command">called </span>
  count (think of this like a function's argument)</li>
  <li>Branch the template when the <span class="command">count </span>variable 
  has data (is greater than zero)</li>
  <li>Add a space character</li>
  <li>Call the template again, recursively</li>
  <li>Set the input parameter to the current count minus one</li>

  <li>Next three lines wrap things up.</li>
</ol>

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

<ol>
  <li value="23">Insert the col1 value</li>
  <li>Call the Space template</li>
  <li>Set the input parameter as the pre-defined column width for column1 
  minus the length of the data value</li>
  <li>End the Space template call</li>
</ol>

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

## Comments

_imported from old Movable Type blog_

> author: James Telfer\
> date: '2008-10-28 18:44:11 -0500'\
> url: http://jtnlex.com/blog
>
> After going through pretty much the same experience as you seem to have with
> this series of posts, I've come up against something you haven't touched on
> yet: output escaping.
>
> I have the output method set to text, which Visual Studio and Xalan honour.
> But when I hook the template up to SSRS, less/greater than signs etc appear as
> their entity escaped values. I can avoid this by using the
> 'disable-output-escaping' attribute on the xsl:text and xsl:value-of elements,
> but according to the spec this should be ignored when the output type is text.
>
> Have you come up against this problem?
>
> Cheers,
> JT

---

> author: Stephen Fuqua\
> date: '2008-10-28 20:15:19 -0500'
>
> I haven't needed these characters in any of my text reports so hadn't run into
> it. Thanks for the heads up!
