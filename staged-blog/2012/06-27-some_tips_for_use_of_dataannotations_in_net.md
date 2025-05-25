---
title: Some Tips for Use of DataAnnotations in .Net
date: '2012-06-27 20:14:22 -0500'
slug: some_tips_for_use_of_dataannotations_in_net
tags:
- tech
- programming
- dotnet

---

Wherein I record a few tips on the use of [System.ComponentModel.DataAnnotations](http://rachelappel.com/asp-net-mvc/how-data-annotations-for-asp-net-mvc-validation-work/),
which I am likely to forget if I do not need to think about them again for some
months&hellip;

<!-- truncate -->

## Unit Testing for Validation Attributes

In your unit tests, do not test the validation &mdash; but rather test to see if
the validation attributes have been applied. See Brad Wilson's blog post, [DataAnnotations
and ASP.NET MVC](http://bradwilson.typepad.com/blog/2009/04/dataannotations-and-aspnet-mvc.html), for details.

## Manual Validation

If you do manually validate, in a unit test or production code, using
`Validator.TryValidateObject` (or other methods in the Validator class), then be
sure to set the `validateAllProperties = true`. By default it is false and that
means that only `Required` properties will be validated. <editorial>Why in
the world is this false by default? The obvious and expected behavior is that
all properties would be validated</editorial>.
`Validator.TryValidateObject(someObject, new ValidationContext(someObject, null,
null), resultList, true)`.

## Validating Related Objects

Validating inherited fields works nicely. But what about composition /
delegation? If you are validating object A, and it is composed of objects B and
C that are also validated, then you need some "deep" validation. There is a
simple recipe for accomplishing this:

1. Implement `IValidatableObject` on class A, which will require you to add a
   method with signature `public IEnumerable<ValidationResult>
   Validate(ValidationContext validationContext)`.
1. Set this method to run `TryValidateObject` on the instance of B and of C.
   Each call to `TryValidateObject` will need its own `ValidationContext`.
   Constructing a `ValidationContext` is simple &mdash; just pass in the object
   itself, and generally it is appropriate to pass null for the second and third
   parameter. Don't forget to throw in a `true` for validating all properties!
   Something like this will work (with opportunity for multiple refactorings):

   ```csharp
   public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
   {
       var resultList = new List<ValidationResult>();

       validationContextB = new ValidationContext(this.InstanceOfB, null, null);
       Validator.TryValidateObject(this.InstanceOfB, validationContextB, resultList, true);

       validationContextC = new ValidationContext(this.InstanceOfC, null, null);
       Validator.TryValidateObject(this.InstanceOfC, validationContextC, resultList, true);

       return resultList;
   }
   ```

1. Now, you wrote a failing unit test for this Validate method before coding it, right?

Caution: if any of the properties directly in A are invalid, then those will be
detected and `Validate(ValidationContext validationContext)` will never be
called.

## Validation Summary in an MVC Partial View

When using partial views for AJAX support in an MVC application, a
`@Html.ValidationSummary()` should be put inside the partial view. If you put it
inside the hosting view, then it will not be populated when you submit a form
inside the partial view.
