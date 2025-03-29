## How routing work in Node.js 
Routing in Node.js is the process of defining how an application response to different HTTP requests (GET, POST, PUT, DELETE, etc.) at specific endpoints (URLs). It help handling user's requests and directing them to the appropriate logic.
### It follow this core logic
1. **Listen for HTTP Requests:** A server continuously listens for request from clients.
2. **Parse Request Data:** The server extracts the HTTP method (GET, PUT, POST, DELETE, etc.) and URL (/home, /users/123).
3. **Match to a Route:** The request is compared against a predefined set of routes.
4. **Execute the Corresponding Handler:** If a match is found, the appropriate function executes.
5. **Return a Response:** A response (HTML, JSON, file, etc.) is sent back to the client.
### Middleware in Routing
Middleware function **intercepts requests** before they reach the final route handler
```
usersRouter.post(
  '/forgot-password', 
  forgotPasswordValidator,
  forgotPasswordController
) 
```
The forgotPasswordValidator would have this format:
```
const forgotPasswordValidator = (req, res, next) => {
    if (!req.body.email) {
        return res.status(400).json({ error: "Email is required" });
    }
    next(); // If valid, move to the next function (controller)
};
```
**Middlewares can:**
- Modify the request (req) or response (res) objects.
- Perform validation (e.g., checking if the body has required fields)
  
**In this case, forgotPasswordValidator:**
```
export const forgotPasswordValidator = validate(
  checkSchema(
    {
      ...
    },
    ['body']
  )
)
```
It's using express-validator, express-validator does not use ```next()``` because it automatically handles validation failures.
-  If the function ```return true```, validation success and Express moves forward.
-  If the function **throws an error**, express-validator captures it and prevent the requests from proceeding. 
