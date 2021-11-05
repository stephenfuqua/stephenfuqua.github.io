Quick notes for future article...

Goal: setup PowerShell Core and Dotnet Core for development in Ubuntu running in Windows subsystem for Linux.

https://www.saggiehaim.net/install-powershell-7-on-wsl-and-ubuntu/

https://docs.microsoft.com/en-us/dotnet/core/install/linux-ubuntu

Need to know which version of Ubuntu you have?

https://help.ubuntu.com/community/CheckingYourUbuntuVersion

Have an root certificate that you need to install?

https://askubuntu.com/questions/73287/how-do-i-install-a-root-certificate

Not sure what type of certificate you have?

https://stackoverflow.com/questions/22743415/what-are-the-differences-between-pem-cer-and-der/22743616

On the dotnet install, take care to install the right SDK - the instructions are for .NET Framework 5, but it is easy to change `5.0` to `3.1` if needed.
