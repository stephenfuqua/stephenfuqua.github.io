---
title: Necessity of Independent Quality Assurance and Usability Testing
date: 2018-5-06
tags: [sdlc]
---

There is a positive a trend of developers doing more of their own testing, going beyond unit testing. However, if independent testers are cut out of the loop, then surely many applications will suffer. Case in point: a user unexpectedly entering a decimal temperatures and military time in a citizen science data collection application.

The [TERN data collection application](https://audubontern.blogspot.com/p/about-texas-estuarine-resource-network.html) supports the Texas Estuarine Research Network's citizen science efforts on the Gulf coast of Texas and has been in operation since 2016. The code and testing were 99% all on my own, in spare time on weekends. I had tried to recruit some help with this open source project, but other than a couple of early code commits, I was unsuccessful in that regard.

<!-- truncate -->

Recently I received a support request for an application error with no obvious explanation. No error log entry was written. Thankfully after a few e-mails, the user sent me a screenshot of the error and the form contents - and I noticed right away that she had entered a decimal temperature value.

Decimal temperature values, regardless of the scale, seem quite reasonable. The problem is, in my personal data collection I always had whole integers. Thus it never occurred that decimal would be desired. The API expected an integer. The form field has a stepwise increment of integers, but the HTML numeric field type also happily accepts decimals. When the decimal was supplied, the WebAPI 2 application was actually throwing an error when trying to deserialize the data. Since this error is a bad request (user data), it was not logged (perhaps I should start logging BadRequests at the WARN level). Since decimal values are real-world legitimate, I changed the data type in the API and database, and now everything is fine.

This user also had helpful input regarding time. Many applications have drop-down menus for times, in 15 or 30 minute increments. I used the [Kendo Time Picker](https://demos.telerik.com/kendo-ui/timepicker/index) control. Unlike some time controls, it doesn't automatically drop the menu down - so you only know about it if you think to click the icon, which is not entirely intuitive. Once you do click on that, it can be a little confusing - are you allowed to type in your own, more precise, answer? I'll need to do a little more research before deciding if/how to improve this.

<div class="image">
![time picker 1](/img/time_picker_1.png)

![time picker 2](/img/time_picker_2.png)
</div>

And what about military time, the user asked? Personally, I can't recall ever doing data entry with military time, so again it didn't occur to me to check on this. It turns out this control is smart in that regard - and so is the back-end API service. The system accepts military time. However, because of changes in format between Angular, Kendo, and .NET code, it ends up being translated back into standard(?) time. Hopefully this isn't too confusing - but it is admittedly odd. In a more robust system, perhaps the user would be able to choose her global preference for which time display to use.
