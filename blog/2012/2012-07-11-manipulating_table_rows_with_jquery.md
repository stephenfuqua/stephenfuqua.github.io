---
layout: page
title: Manipulating Table Rows with jQuery
date: '2012-07-11 21:48:13 -0500'
basename: manipulating_table_rows_with_jquery
tags:
- tech
- programming
- javascript
excerpt_separator: <!-- truncate -->
---

**Problem:** need to move rows up and down, and from one table to another, in an
HTML page.

**Solution:** careful use of jQuery. There are probably many different solutions
already out there, but I wanted to learn how to write one for myself. Key
functions: [closest](http://api.jquery.com/closest/), [detach](http://api.jquery.com/detach/), [append](http://api.jquery.com/append/), [prev](http://api.jquery.com/prev/), [next](http://api.jquery.com/next/), [before](http://api.jquery.com/before/), and [after](http://api.jquery.com/after/).

<!-- truncate -->

## Demonstration

<table id="table1" style="background-color: Lime" class="displayTable">
    <caption>Table 1</caption>
    <thead>
        <tr>
            <th>One</th>
            <th>Two</th>
            <th>Three</th>
        </tr>
    </thead>
    <tbody>
        <tr id="row1">
            <td>R1 C1</td>
            <td>R1 C2</td>
            <td>
                <a href="#" id="row1Link" class="rowLink">Move Me</a> |
                <a href="#" id="row1Up" class="rowUp">Up</a> |
                <a href="#" id="row1Down" class="rowDown">Down</a>
            </td>
        </tr>
        <tr id="row2">
            <td>R2 C1</td>
            <td>R2 C2</td>
            <td>
                <a href="#" id="row2Link" class="rowLink">Move Me</a> |
                <a href="#" id="row2Up" class="rowUp">Up</a> |
                <a href="#" id="row2Down" class="rowDown">Down</a>
            </td>
        </tr>
        <tr id="row3">
            <td>R3 C1</td>
            <td>R3 C2</td>
            <td>
                <a href="#" id="row3Link" class="rowLink">Move Me</a> |
                <a href="#" id="row3Up" class="rowUp">Up</a> |
                <a href="#" id="row3Down" class="rowDown">Down</a>
            </td>
        </tr>
    </tbody>
</table>
<table id="table2" style="background-color: Yellow; margin-top: 30px;" class="displayTable">
    <caption>Table 2</caption>
    <thead>
        <tr>
            <th>One</th>
            <th>Two</th>
            <th>Three</th>
        </tr>
    </thead>
    <tbody>
    </tbody>
</table>

## Table Source Code

A couple of very basic tables, with "action" links in the third column. Judicious use of id and class attributes will turn out to be very helpful&hellip;

```html
<table id="table1" style="background-color: Lime" class="displayTable">
      <caption>Table 1</caption>
      <thead>
          <tr>
              <th>One</th>
              <th>Two</th>
              <th>Three</th>
          </tr>
      </thead>
      <tbody>
          <tr id="row1">
              <td>R1 C1</td>
              <td>R1 C2</td>
              <td>
                  <a href="#" id="row1Link" class="rowLink">Move Me</a> |
                  <a href="#" id="row1Up" class="rowUp">Up</a> |
                  <a href="#" id="row1Down" class="rowDown">Down</a>
              </td>
          </tr>
          <tr id="row2">
              <td>R2 C1</td>
              <td>R2 C2</td>
              <td>
                  <a href="#" id="row2Link" class="rowLink">Move Me</a> |
                  <a href="#" id="row2Up" class="rowUp">Up</a> |
                  <a href="#" id="row2Down" class="rowDown">Down</a>
              </td>
          </tr>
          <tr id="row3">
              <td>R3 C1</td>
              <td>R3 C2</td>
              <td>
                  <a href="#" id="row3Link" class="rowLink">Move Me</a> |
                  <a href="#" id="row3Up" class="rowUp">Up</a> |
                  <a href="#" id="row3Down" class="rowDown">Down</a>
              </td>
          </tr>
      </tbody>
  </table>
  <table id="table2" style="background-color: Yellow; margin-top: 30px;" class="displayTable">
      <caption>Table 2</caption>
      <thead>
          <tr>
              <th>One</th>
              <th>Two</th>
              <th>Three</th>
          </tr>
      </thead>
      <tbody>
      </tbody>
  </table>
```

## Between Tables

One principle is that I don't want to hard-code all of the ID values. But that didn't work out entirely. Write a function and apply it to the click event of all of the elements with class "rowLink". In that function, find the parent row. Then find that row's parent table. Remove the row from the display &mdash; but use `detach` instead of `remove` so that the HTML still exists. See if that table is table1. There's the hard coding. If so, append the row into table2. Then it seems nice to help the reader notice that the row has moved.

```javascript
// Setup the "Move Me" links
$(".rowLink").click(function () {
    // get the row containing this link
    var row = $(this).closest("tr");

    // find out in which table it resides
    var table = $(this).closest("table");

    // move it
    row.detach();

    if (table.is("#table1")) {
        $("#table2").append(row);
    }
    else {
        $("#table1").append(row);
    }

    // draw the user's attention to it
    row.fadeOut();
    row.fadeIn();
});
```

## Up and Down

Now apply a function to the click event of all the elements with class "rowUp."
Again get the current row. Then get the previous element. If the previous
element is itself a row, then there is room to move up &mdash; so `detach` the
row and move it before the previous row. Otherwise do nothing. For moving down,
simply switch from `prev` to `next` and `before` to `after`.

```javascript
// Setup the "Up" links
$(".rowUp").click(function () {
    var row = $(this).closest("tr");

    // Get the previous element in the DOM
    var previous = row.prev();

    // Check to see if it is a row
    if (previous.is("tr")) {
        // Move row above previous
        row.detach();
        previous.before(row);

        // draw the user's attention to it
        row.fadeOut();
        row.fadeIn();
    }
    // else - already at the top
});
```

<script type="text/javascript">
    $(document).ready(function () {
        // Setup the "Move Me" links
        $(".rowLink").click(function () {
            // get the row containing this link
            var row = $(this).closest("tr");

            // find out in which table it resides
            var table = $(this).closest("table");

            // move it
            row.detach();

            if (table.is("#table1")) {
                $("#table2").append(row);
            }
            else {
                $("#table1").append(row);
            }

            // draw the user's attention to it
            row.fadeOut();
            row.fadeIn();
        });

        // Setup the "Up" links
        $(".rowUp").click(function () {
            var row = $(this).closest("tr");

            // Get the previous element in the DOM
            var previous = row.prev();

            // Check to see if it is a row
            if (previous.is("tr")) {
                // Move row above previous
                row.detach();
                previous.before(row);

                // draw the user's attention to it
                row.fadeOut();
                row.fadeIn();
            }
            // else - already at the top
        });

        // Setup the "Up" links
        $(".rowDown").click(function () {
            var row = $(this).closest("tr");

            // Get the previous element in the DOM
            var next = row.next();

            // Check to see if it is a row
            if (next.is("tr")) {
                // Move row above previous
                row.detach();
                next.after(row);

                // draw the user's attention to it
                row.fadeOut();
                row.fadeIn();
            }
            // else - already at the bottom
        });
    });
</script>
