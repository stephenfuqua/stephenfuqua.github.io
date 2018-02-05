---
layout: page
title: Beta 1 Uses Cases
date: 2016-01-12
comments: true
category: ops
tags: [toolkit]
sharing: true
---

The first beta release of FlightNode is now alive and in the hands of testers. 
So what's been delivered?

<img src="/images/beta1_home_small.png" width="395" height="221" id="imgHome" 
class="popup-img center-block" data-toggle="modal" data-target="#imgModal">

## Context-Aware Navigation

Although eventually there will be more roles, for now there are effectively just 
two: Reporter and Administrator. The user naturally should see different 
navigation links when logged in.

<img src="/images/beta1_authenticated_small.png" width="449" height="143" id="imgAuthenticated" 
class="popup-img center-block" data-toggle="modal" data-target="#imgModal">

## User List

As an Administrator, I want to view a list of existing users, so that I can
find a user to edit.

<img src="/images/beta1_users_small.png" width="397" height="230" id="imgUsers" 
class="popup-img center-block" data-toggle="modal" data-target="#imgModal">

## List Filtering

As an Administrator, I want to filter the user list so that, so that I can more
quickly find a particular user.

<img src="/images/beta1_filter_small.png" width="400" height="230" id="imgFilter" 
class="popup-img center-block" data-toggle="modal" data-target="#imgModal">

## User Create and Edit

As an Administrator, I want to create / edit a user, so that user can sign-on
to the system.

<img src="/images/beta1_filter_small.png" width="400" height="230" id="imgFilter" 
class="popup-img center-block" data-toggle="modal" data-target="#imgModal">

## Log a Workday

As an Administrator, I want to log a volunteer workday on behalf of a 
Reporter, so that I can track volunteer hours.

As a Reporter, I want to log my own workday, so that the project can
track my volunteer hours. (Not shown).

<img src="/images/beta1_logWorkday_small.png" width="394" height="346" id="imgLog" 
class="popup-img center-block" data-toggle="modal" data-target="#imgModal">

## List Workdays

As an Administrator, I want to list all workday logs, so that I can make
corrections as needed.

As a Reporter, I want to list all of my workday logs, so that I can make 
corrections as needed. (Not shown).

As an Administrator, I want export all workday logs, so that I can analyze
the data outside of the website. (Only the button shown).

As a Reporter, I want to export all of my workday logs, so that I can tally
my volunteer hours. (Not shown).

<img src="/images/beta1_workdays_small.png" width="394" height="346" id="imgWorkList" 
class="popup-img center-block" data-toggle="modal" data-target="#imgModal">

## Supporting Stories

As an Adminstrator, I want to list / create / edit geographic locations, so
that Reporters can log time at specific locations.

As an Administrator, I want to list / create / edit work types, so that 
Reporters can log time for a specific type of work.

As an Administrator, I want to list / create / edit bird species, so that
Reporters can log bird survey data. (Referring to future functionality).

<div class="modal fade" tabindex="-1" role="dialog" id="imgModal">
  <div class="modal-dialog modal-lg">
      <div class="modal-body">
       	<img src="/images/beta1_home.png" id="modalHome" width="987" height="553">
       	<img src="/images/beta1_authenticated.png" id="modalAuthenticated" width="898" height="286">
       	<img src="/images/beta1_users.png" id="modalUsers" width="993" height="583">
       	<img src="/images/beta1_filter.png" id="modalFilter" width="999" height="575">
       	<img src="/images/beta1_logWorkday.png" id="modalLog" width="984" height="865">
       	<img src="/images/beta1_logWorkList.png" id="modalWorkList" width="984" height="865">
    </div>
  </div>
</div>

<script>
$(function() {
	var hideAll = function() {
		$("#modalHome").hide();
	};
	hideAll();

	var reveal = function(id) {
		return function() {
			hideAll();
 			$("#"+id).show();
		}
	};

	$("#imgHome").click(reveal("modalHome"));
	$("imgAuthenticated").click(reveal("modalAuthenticated"));
	$("imgUsers").click(reveal("modalUsers"));
	$("imgFilter").click(reveal("modalFilter"));
	$("imgLog").click(reveal("modalLog"));
	$("imgWorkList").click(reveal("modalWorkList"));
});
</script>       
        
<style>
.modal-lg {
	width: 1100px;
	text-align: center;
}
.popup-img {
	cursor: pointer;
}
</style>