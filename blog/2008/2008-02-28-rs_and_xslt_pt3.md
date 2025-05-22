---
layout: page
title: 'RS and XSLT, pt3.1: Using XSLT for Custom Reporting Services Output'
date: '2008-02-28 14:54:25 -0600'
basename: rs_and_xslt_pt3
tags:
- tech
- database
- sql-server
excerpt_separator: <!-- truncate -->
---

The last two posts have touched on some issues related to Reporting Services and
XML transforms. Now I'll go back and put the pieces together, flesh in some more
detail, and try to give a coherent picture of what I was trying to accomplish
and how it worked out. Doing so will require a sub-series of posts, call them
parts 3._x_ to the "RS and XSLT" series.

**Problem:** A customer has asked for a report, in plain ASCII text, that will
contain a header record, a bunch of pipe delimited detail records, and a trailer
record. Reporting Services' subscription capabilities are ideal for the report
delivery, but does not have any built-in way to support this kind of output. One
can use CSV export, but:

<!-- truncate -->

<ul>
<li>that restricts the user to commas rather than pipes (or other characters),</li>
<li>column headers are always included in the output</li>
<li>any text in a textbox above (i.e. header text) or below (i.e. trailer text) a main table will be added at the beginning and ending of each detail record.</li>
</ul>

**Solution:** Use XML export coupled with XML stylesheet transformations to
develop a custom export provider.

## Desired Output

Dynamic elements are indicated with angle brackets.

```none
HEADER, MYREPORT, <datetime>
<col1 data>|<col2 data>|<col3 data>
<col1 data>|<col2 data>|<col3 data>
...
TRAILER, <row count>
```

## Designing the Report

The report design is rather simple. I've created a dataset with the rather
pedestrian name of `DataSet1` using the following query to give me some fake
data:

```sql
select 'r1c1' as col1, 'r1c2' as col2, 'r1c3' as col3
union
select 'r2c1' as col1, 'r2c2' as col2, 'r2c3' as col3
union
select 'r3c1' as col1, 'r3c2' as col2, 'r3c3' as col3
```

Each dynamic element to be included in the  header and trailer record can be
placed in its own text box. Be sure to give that textbox a useful name, and use
that name in the DataElementName field. The data results are placed in a table
with no header or footer, and each column is given a sensible name in the
DataElementName field. The table itself should be given a good name; I prefer to
standardize each report's main table with the name `resultSet`

<p class="center">{Image files no longer available}</p>
<!--
<span class="mt-enclosure mt-enclosure-image"><img alt="report designer.jpg" src="http://www.safnet.com/writing/tech/report%20designer.jpg" width="408" height="135" /></span>
Report Design
-->
<!--
<span class="mt-enclosure mt-enclosure-image"><img alt="textbox properties.jpg" src="http://www.safnet.com/writing/tech/textbox%20properties.jpg" width="287" height="152" /></span>
Partial view of the properties for the "Now" textbox
-->
<!--
<span class="mt-enclosure mt-enclosure-image"><img alt="column properties.jpg" src="http://www.safnet.com/writing/tech/column%20properties.jpg" width="290" height="153" /></span>
Partial view of the properties for the first column in the resultSet table.
-->

## XML Output

Here's the raw XML output before any transformations have been applied (note presence of the custom namespace):

```xml
<?xml version="1.0" encoding="utf-8"?>
<Report p1:schemaLocation="RsXsltDemo
http://reportserver?%2fRsXsltDemo&amp;amp;rs%3aFormat=XML&amp;amp;rc%3aSchema=True" Name="RsXsltDemo"
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
</pre>
```

Now it is time to pause. Look for the next steps next week!
