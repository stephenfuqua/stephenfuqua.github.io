---
title: Running FlightNode Locally
date: 2015-10-26
tags:
- tech
- programming
- FlightNode
---

In order to run FlightNode locally:

## 1. Retrieve all Repositories

Make local copies of all the repositories mentioned in the [Architecture](https://flightnode.github.io/coding/architecture//coding/architecture)
page. Be sure to configure an `upstream` remote and follow the workflow
described in [Git Tutorials, Workflow, and GUI](./10-24-git_tutorials_workflow_gui.md).

## 2. Start the Identity API

Open the FlightNode.Identity solution in Visual Studio 2015. Open the
Package Manager Console (menu: `Tools > NuGet Package Manager > Package
Manager Console`).

<!-- truncate -->

### Download NuGet Packages

The Package Manager Console will have a button for downloading missing
packages, if there are any.

### Install the Database

Instll is handled using Entity Framework's [Code First Migrations](https://msdn.microsoft.com/en-us/data/jj591621.aspx).

In that same Console, change the Default Project to `Identity\FlightNode.Identity`.
Then type in`Update-Database` - even if this is the initial install. Any time
the database schema changes, you'll need to rerun this command.

### Run the Solution

Now, run the solution. The project `FlightNode.Identity.App` should be
the startup project.

## 3. Start the website

This could be configured for startup in Visual Studio Code, but I like the
command line... open git-bash and switch to the `FlightNode.Demo`
workspace directory.

### Download NPM Packages

```shell
npm install
```

### Run the Project

```shell
npm start
```

or

```shell
grunt serve
```
