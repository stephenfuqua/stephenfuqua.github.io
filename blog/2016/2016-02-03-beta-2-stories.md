---
title: FlightNode Beta 2 User Stories
date: 2016-02-03
slug: flightnode_beta_2_user_stories
tags:
- tech
- programming
- FlightNode
---

This release candidate nearly wraps up the user management and volunteer work
tracking functionality. There are a small few "should have" features that will
be added in a future release. So what's new?

## Self Registration

*As a Volunteer, I want to register as a site user, so that I can submit data to
the project.*

Naturally, they can't take an existing user name, as seen in the following
screenshot. All new users will be created under the Reporter role, though of
course an admin can give additional privileges.

![Registration form](/images/rc2_1.png)

Once the registration is completed, the user receives a friendly message. The
user can still see what was previously submitted,  but the form is disabled so
that the data cannot be re-submitted.

![Registration complete](/images/rc2_2.png)

What's missing? E-mail notifications.

## Approve Registrations

*As a Project Coordinator, I want to approve volunteer user registrations, so
that access to the site’s data collection is strictly limited.*

New users cannot immediately login; they must instead be approved by and admin.
Administrators have a new option under the Manage menu: Pending Users.

![Pending users menu](/images/rc2_3.png)

This link brings the admin to a page displaying all pending users.

![Pending users list](/images/rc2_4.png)

Click the checkmark in the first column to select a particular record, or the
checkmark at the top of the column to select all records. Click the approve
button to allow that user to sign into the system. Once the user is approved,
that user will show up in the normal user list.

![Normal user list](/images/rc2_5.png)

What's missing: e-mail alerts. Delete registrations that should not be approved
(spam registrants).

## My Account

*As a Volunteer, I want to maintain my contact information, so that project
staff will be able to contact me at need.*

In a prior screenshot showing the menus, you can see the new "My Account" link,
which is available to all signed-in users. The account form looks familiar. Note
that you cannot change your own roles in the system.

![My Account](/images/rc2_6.png)

What's missing? Nothing.

## Account Deactivation

*As an Project Coordinator, I want to de-activate volunteers who are no longer
working with the project, so that they can no longer submit data to the site.*

![De-activation](/images/rc2_7.png)

What's missing: re-activation.
