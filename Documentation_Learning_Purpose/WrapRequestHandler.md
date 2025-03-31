## Why wrapRequestHandler?
- Don't have to use try...catch inside every route.

## What is the `<P>`?
- Generic type in TypeScript. Allows the function to be more flexible by specifying the type of request parameters dynamically.

- `<P>` is a generic type that represents the type of the request parameters (`req.params`).

- `RequestHandler<P>` is an Express type that defines a request handler function where `req.params` is of type P.

## Example
**Example Without `<P>` (Loose Typing):**
```
app.get('/users/:id', wrapRequestHandler(async (req, res) => {
  const userId = req.params.id  // ❌
  res.json({ userId })
}))
```
**TypeScript doesn't know the type of `id`**

```
app.get('/users/:id', wrapRequestHandler<{ id: string }>(async (req, res) => {
  const userId = req.params.id // ✅
  res.json({ userId })
}))
```
**TypeScript knows `id` is a string**