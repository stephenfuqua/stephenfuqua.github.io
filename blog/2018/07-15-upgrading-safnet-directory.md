---
title: "Upgrading safnet-directory, Part 1: Trivial Cleanup"
date: 2018-07-15
tags: [dotnet, architecture]
---

<!-- TODO: update link -->

In 2014 I built a [quick-and-dirty web application](/archive/2014/12/01/safnet-directory/) using ASP.NET MVC5 and AngularJS 1.0.2. There are probably millions of web applications, large and small, that are "stuck" on some older tech, often because people are afraid of the work it will take to modernize them. In this series of blog posts, I'll refactor away the tech debt and polish it up this little app to make it something to be proud of... as much as one can be proud of a simplistic proof-of-concept, anyway.

First up: basic and trivial cleanup of the solution, bringing it up to .NET 4.7.2. Future: improved testing; ASP.NET Core; Entity Framework Core and better separation of concerns; UI libraries / frameworks.

<!-- truncate -->

:::info

All work in this and subsequent posts will be using Visual Studio 2017, git-bash, and other free tools.

:::

## Improve the Name

Long pascalCased names are not in favor any more. Snake case has become deservedly popular - it is easier to read. So let's rename this project from `safnetDirectory` to `safnet-directory`. GitHub repo's staying put though, out of laziness.

## The .nuget Directory Is Pass&eacute;

In the early days, no doubt for what were at the time good reasons, Microsoft had us creating `.nuget` folders containing `nuget.exe`, `nuget.config`, and `nuget.targets`. Right around the time that I created this application, perhaps just afterward, Microsoft eliminated the need for it (check out the evolution of the [Stack Overflow discussion](https://stackoverflow.com/questions/9146094/should-nuget-folder-be-added-to-version-control)).

```bash
git rm -r .nuget
```

But that's not enough, because the project file references `nuget.targets`. Remove these lines from `*.csproj`:

```xml
 <Import Project="$(SolutionDir)\.nuget\NuGet.targets" Condition="Exists('$(SolutionDir)\.nuget\NuGet.targets')" />
  <Target Name="EnsureNuGetPackageBuildImports" BeforeTargets="PrepareForBuild">
    <PropertyGroup>
      <ErrorText>This project references NuGet package(s) that are missing on this computer. Enable NuGet Package Restore to download them.  For more information, see http://go.microsoft.com/fwlink/?LinkID=322105. The missing file is {0}.</ErrorText>
    </PropertyGroup>
    <Error Condition="!Exists('$(SolutionDir)\.nuget\NuGet.targets')" Text="$([System.String]::Format('$(ErrorText)', '$(SolutionDir)\.nuget\NuGet.targets'))" />
</Target>
```

## Update the Solution

Not everyone is ready to commit to ASP.NET Core. For starters, let's at least move it up from .NET 4.5 to [.NET 4.7.2](https://docs.microsoft.com/en-us/dotnet/framework/install/guide-for-developers) and the latest versions of all NuGet dependencies.

* Change [the target framework](https://docs.microsoft.com/en-us/visualstudio/ide/how-to-target-a-version-of-the-dotnet-framework)
* Update the `<httpRuntime>` to 4.7.2 to turn off "[legacy quirks](https://dennisgorelik.livejournal.com/132999.html)"
* Really old code? Consider looking through the [Migration Guide to the .NET Framework 4.7, 4.6, and 4.5](https://docs.microsoft.com/en-us/dotnet/framework/migration-guide/).
* Run Code Analysis with [Microsoft Managed Recommended Rules](https://docs.microsoft.com/en-us/visualstudio/code-quality/managed-recommended-rules-rule-set-for-managed-code).

This app is simple. Not surprisingly, there are no build errors or warnings.

Now update all of the NuGet packages to the latest (not .NET Core / Standard) libraries (26 updates available!). Interestingly, it took four rounds of updates to get through everything.

Did anything break? No build errors, warnings, or messages. But some unit tests failed - because this was a quick-and-dirty application, and I didn't have time to write them properly. The failed tests were actually integration tests and they depended on the state of the database. Before making more radical changes (.net core), I should fix up the test project.

### Web API

The API in this case was simply using MVC controllers and returning JSON, instead of using Web API. In ASP.NET COre the web libraries were merged into one framework instead of two. As the last step in this initial refactoring foray, I'll convert the API endpoints to use Web API. Since I don't have unit tests yet, I will not change the business logic in any way; only the method signatures and return statements should change. This way I don't create unit tests for the old way and then modify them twice (once to Web API and once to APS.NET Core MVC).

Here's a funtion from the `HomeController`:

```csharp
[Authorize(Roles = AdminController.HR_ROLE)]
public JsonResult GetRecord(string id)
{
    using (var db = new Models.ApplicationDbContext())
    {
        var employee = db.Users
            .Where(x => x.Id == id)
            .Select(Map)
            .FirstOrDefault();

        return Json(employee, JsonRequestBehavior.AllowGet);
    }
}
```

Steps to take:

1. Install Web API Nuget packages (`Install-Package Microsoft.AspNet.WebApi; Install-Package Microsoft.AspNet.WebApi.OwinSelfHost`) and [configure it to run in OWin](https://docs.microsoft.com/en-us/aspnet/web-api/overview/advanced/configuring-aspnet-web-api);
1. This API is dealing with Employees, so I will create `api/EmployeeController.cs` with route `api/employee`, then
1. Move this method to the new controller, renaming it to `Get`, and finally
1. Change the return type from `JsonResult` to `IHttpActionResult`, without conversion to async (that can come with EF Core upgrade).

```csharp
[HttpGet]
[Authorize(Roles = AdminController.HR_ROLE)]
public IHttpActionResult Get([FromUri] string id)
{
    using (var db = new ApplicationDbContext())
    {
        var employee = db.Users
            .Where(x => x.Id == id)
            .Select(Map)
            .FirstOrDefault();

        return Ok(employee);
    }
}
```

There are a few other "API" methods in the `HomeController`, and of course I'll move those over as well. And apply proper attributes (`HttpGet`, `HttpPost`, `Authorize`, `FromBody`, `FromUri`). All told, it is a quick and painless process - at least for an application of this size ;-).

Well, not so quick... a few adjustments to be made in AngularJs as well. For starters, there's the new routing for Employee CRUD operations. And, those operations will be using JSON instead of form encoding (that required custom code, which I now rip out). The URL I had defined in a global `api` object in `_Layout.cshtml`. For now I'll leave it there and just update the routes. Finally, the search form was JSON-encoding an object and injecting that into the query string; that's just weird and should be a plain query string, i.e. from `&searchModel=%7B%22name%22%3A%22Stephen%22%2C%22title%22%3A%22%22%2C%22location%22%3A%22Austin%22%2C%22email%22%3A%22%22%7D` to `&name=Stephen&location=Austin` for a search on the `name` and `location` properties.

Code change in `app.js`. Old:

```javascript
$http.get(api.employeePaging, { params: { pageSize: pageSize, page: page, searchText: searchText } })
```

New code, good enough for the moment:

```javascript
var params = {
    pageSize: pageSize,
    page: page,
    name: searchText.name,
    location: searchText.location,
    title: searchText.title,
    email: searchText.email
};
$http.get(api.employeePaging, { params: params })
```

### Testing

The application is nearly as fully functional as before, but the CSS is messed up. Perhaps because I accidentally upgraded to Bootstrap 4.1.1. Back to 3.3.7 now, as I am not ready for BS 4. Indeed, that fixed it. While I am at it, I might as well remove Modernizr and Respond - no need to support old browsers. Also messed up: the Edit Employee modal dialog doesn't close on save, but rather throws a very obscure-looking AngularJS error. Going to upgrade the UI in the future and this is very old AngularJS (1.0.2), so I will ignore it for now.

Full file diffs in [pull request 1](https://github.com/stephenfuqua/safnetDirectory/pull/1).
