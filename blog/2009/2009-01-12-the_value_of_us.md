---
title: The value of using braces to avoid code defects
date: '2009-01-12 12:13:48 -0600'
slug: the_value_of_us
tags:
- tech
- dotnet
- programming

---

Something I was reading this weekend pointed out that leaving braces out of a
one-line block can be dangerous. For instance, it is correct to code the
following (and I do it all the time!)

```csharp
if (someCondition)
    this.doSomething();
```

<!-- truncate -->

There are two different ways this can be problematic. Let's give a little more
context. Perhaps the code has this:

```csharp
if (someCondition)
    this.doSomething();
    this.doAnotherThing();
```

Now, if the programmer had let Visual Studio control the tabs properly, then
this would be more clear:

```csharp
if (someCondition)
    this.doSomething();
this.doAnotherThing();
```

We can't necessarily count on this tabbing though. So when someone new comes in
and looks at the code, what are the chances that this person will think that
`this.doAnotherThing()` is being called in the if block? I don't know the
percentage, but it is probably too high. The other side of the confusion comes
in when a programmer decides to augment the original if block with a call to
1doAnotherThing()1 (for example). Perhaps that programmer wasn't paying enough
attention, and didn't notice that there are no braces. Then in this example we
would have a real problem &mdash; 1doAnotherThing()1 is being called all the time,
when it should only be called as part of the condition!

After thinking about these issues, I am resolving to not take the lazy step that
I've always liked and preferred &mdash; that is, to no longer leave out curly
braces when the block statement has only one line. This will also been seen with
many using statements.
