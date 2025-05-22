---
title: Autoscrolling in the DataGridView
date: '2007-05-30 15:48:51 -0500'
slug: autoscrolling_i
tags: [tech, dotnet]
excerpt_separator: <!-- truncate -->
---

**Problem**: In a .Net 2.0 Windows Forms application, user action causes a new
row to be added to a DataGridView control. When the viewport fills up, causing
the vertical scrollbar to appear, the most recent entry is hidden "below the
fold" &mdash; off the screen. Users want to see the latest entry at all times.

<!-- truncate -->

**Solution**: turns out to be relatively easy.  But first, it is important to
know what control you're dealing with. Because I don't program in Windows Forms
very often, I forgot that I'm now using a DataGridView control instead of a
DataGrid control. So that stymied me for a bit.

First thing I needed was to recognize that the latest entry is now off the
screen &mdash; in other words, I had to recognize that the scrollbar is showing.
Found a very helpful [newsgroup
posting](http://groups.google.com/group/microsoft.public.dotnet.framework.windowsforms.controls/browse_thread/thread/54f69a9aec43d913/087328404ccdf5ac?lnk=st&q=ScrollLastRowIntoView&rnum=1#087328404ccdf5ac) for that.

That posting actually describes moving the scrollbar independently of the grid.
Not exactly what I want. After a bit more searching, I found that the [FirstDisplayedScrollingRowIndex](http://msdn2.microsoft.com/en-us/library/system.windows.forms.datagridview.firstdisplayedscrollingrowindex.aspx)
property. That does it. I have my solution:

```csharp
/// <summary>
/// Scrolls the datagrid so that the bottommost entry is always showing
/// </summary>
private void autoScroll()
{
     if (this.gridBatch.Visible)
     {
          foreach (Control ctl in this.gridBatch.Controls)
          {
               if (ctl is VScrollBar)
               {
                    VScrollBar scroll = (VScrollBar)ctl;
                    if (scroll.Visible)
                    this.gridBatch.FirstDisplayedScrollingRowIndex = this.gridBatch.FirstDisplayedScrollingRowIndex + 1;
               }
          }
     }
}
```

## Comments

_imported from old Movable Type blog_

> author: obisunk<br>
> date: '2007-09-29 03:42:29 -0500'
>
> Works like a charm =)
>
> Thanks for sharing.

---

> author: Praveen<br>
> date: '2008-03-19 18:07:31 -0500'\
> url: http://praveensg.com
>
> Beautiful.
