# sails-hook-auditor
Sails Js Auditor PROJECT hook intercepting both requests and responses and allowing audit/logging/any custom functioanlity

This is a Sails js **porject** hook which allows the interception of the requests and responses and when both are decorated with **"audit"** object will intercept it.
One use case for this is when a request or response are contain "audit" in their payload log it for auditing purposes. 
But as you can imagine it could serve other purposes. 

Please note this is a project hook and not a "installable" hook. It must reside under api/hook folder in your project.

Also current defaults are to actual key you would like to intercept from the payload currently set to **"audit"** and also the option **"clearResponseAuditOnClient"** to remove the object from the response so that it does not reach the client.
