---
layout: page
title: Running FlightNode Locally
date: 2015-10-26
comments: true
category: programming
tags: [toolkit]
sharing: true
---

In order to run FlightNode locally:

## 1. Retrieve all Repositories

Make local copies of all the repositories mentioned in the [Architecture](/coding/architecture)
page. Be sure to configure an `upstream` remote and follow the workflow
described in [Git Tutorials Etc](/archives/2015-24-git-tutorials-etc).

## 2. Start the Identity API

Open the FlightNode.Identity solution in Visual Studio 2015. Open the 
Package Manager Console (menu: <tt>Tools > NuGet Package Manager > Package
Manager Console</tt>). 

### Download NuGet Packages
The Package Manager Console will have a button for downloading missing
packages, if there are any.

### Install the Database

Instll is handled using Entity Framework's [Code First Migrations](https://msdn.microsoft.com/en-us/data/jj591621.aspx).

In that same Console, change the Default Project to <tt>Identity\FlightNode.Identity</tt>. 
Then type in `Update-Database` - even if this is the initial install. Any time
the database schema changes, you'll need to rerun this command.

### Run the Solution

Now, run the solution. The project <tt>FlightNode.Identity.App</tt> should be
the startup project.

## 3. Start the website

This could be configured for startup in Visual Studio Code, but I like the 
command line... open git-bash and switch to the <tt>FlightNode.Demo</tt>
workspace directory.

### Download NPM Packages

    npm install
	
### Run the Project

    npm start
	
or 
    
	grunt serve
	