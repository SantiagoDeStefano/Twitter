## Why `defaultErrorHandler`?

- Handles errors consistently in the API.

- Formats error responses properly for the client.

## How did it work?

- If the error is an instance of `ErrorWithStatus`:

  - It sends a JSON response with all properties except `status`.

  - This prevents exposing the status code in the response body.

- If the error is an unknown error:

  - It ensures all properties of err are **enumerable**, so they can be included into JSON response.
  - Responds with a 500 Internal Server Error, including:

    - **message**: An error message.

    - **errorInfo**: The full error object (debugging).

## defaultErrorHandler explain

```
if (err instanceof ErrorWithStatus) {
  res.status(err.status).json(omit(err, ['status']))
  return
}
```

Sends a JSON response **without** the `status` field.
