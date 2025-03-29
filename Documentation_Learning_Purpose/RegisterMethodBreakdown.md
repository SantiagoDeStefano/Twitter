# User's input

## Client would send a request to the server with information, the information including these field

```
  name,
  email,
  password,
  confirm_password,
  date_of_birth
```

`const user_id = new ObjectId()` would create a new unique `_id` with **MongoDB-generated** identifier `ObjecetId()`

# We would have to understand what is signing JWT first

```
export const signToken = ({
  payload,
  privateKey,
  options = {
    algorithm: 'HS256'
  }
}: {
  payload: string | Buffer | object,
  privateKey: string,
  options?: jwt.SignOptions
}) => {
  return new Promise((resolve, reject) => {
    jwt.sign(payload, privateKey, options, (error, token) => {
      if(error) {
        throw reject(error)
      }
      resolve(token as string)
    })
  })
}
```

`JWT` include `HEADER` `PAYLOAD` `SIGNATURE`

### `HEADER`:

The **HEADER** contains metadata (data that provide information about one or more aspects of the data)

Example:

```
{
  "alg": "HS256",
  "typ": "JWT"
}
```

`"alg": "HS256"`. Means HMAC SHA-256 is used for signing.

`"typ": "JWT"`. Specifies that this is a JWT.

This come from

```
options = {
  algorithm: 'HS256'
}
```

### `PAYLOAD`:

The **PAYLOAD** contains the actual data (user-related information)

Example:

```
{
  "user_id": "65dcbf1e2f3b1234abcd5678",
  "token_type": "EmailVerifyToken",
  "verify": "Unverified"
}
```

`"user_id"`. The unique identifier for the user.

`"token_type"`. Identifies the purpose of the token.

`"verify"`. The verification status.

This come from:

```
payload = {
  user_id,
  token_type: TokenType.EmailVerifyToken,
  verify
}
```

### `SIGNATURE`:

The **SIGNATURE** is a cryptographic hash that ensures the token hasn't been modified

Generated using:

```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  privateKey
)
```

This come from:

`privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string`

## Full JWT Example:

```
HEADER:
{
  "alg": "HS256",
  "typ": "JWT"
}

PAYLOAD:
{
  "user_id": "65dcbf1e2f3b1234abcd5678",
  "token_type": "EmailVerifyToken",
  "verify": "Unverified"
}

SIGNATURE:
{
  privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string
}
```

## Back to the function

```
const email_verify_token = await this.signEmailVerifyToken({
  user_id: user_id.toString(),
  verify: UserVerifyStatus.Unverified
})
```

In this case, the full JWT would have these information:

```
HEADER:
{
  alg: "HS256",
  typ: "JWT"
}

PAYLOAD:
{
  user_id: new ObjectId(),
  token_type: TokenType.EmailVerifyToken,
  verify: Unverified
}

SIGNATURE:
{
  privateKey: process.env.JWT_SECRET_EMAIL_VERIFY_TOKEN as string
}

OPTIONS:
{
  expiresIn: process.env.EMAIL_VERIFY_TOKEN_EXPIRES_IN as any
}
```

This will create `email_verify_token`

```
await DatabaseService.user.insertOne(
    new User({
    ...payload,
    _id: user_id,
    username: `user${user_id.toString()}`,
    email_verify_token,
    date_of_birth: new Date(payload.date_of_birth),
    password: hashPassword(payload.password)
  })
)
```

## The database method would be used

```
await DatabaseService.user.insertOne(
  new User({
    ...payload,
    _id: user_id,
    username: `user${user_id.toString()}`,
    email_verify_token,
    date_of_birth: new Date(payload.date_of_birth),
    password: hashPassword(payload.password)
  })
)
```

These fields would be included in the `user` collection.

# We would have to understand what is access token and refresh token first

## I have not done anything with cookie yet, so no cookie document

## Problem

Every request client send to server have to include `session id` to authorize which is this `user`, do they have permision to access server's resource? This `session id` would be stored server's database, each request would require one database's query. Thus, increase the request's time.

## Access Token

- With JWT, we would create a JWT with user's information (e.g. `user_id`) and send to user. The server would not have to store this JWT token. Each time user send a request to server, send this JWT token instead. Server would just have to verify this JWT token to know which user is this, which permision they have.
- This method of using token for authorization is called **Token Based Authentication**

## User authorization with access token flow

![alt text](image.png)

1. Client a request that would access protected resource to server. If client is `UNAUTHORIZE`, return `401_UNAUTHORIZE`. Client need to send **username and password** to server.

2. Server would verify authorization data to server's database. If authorize data exists, create a JWT including **payload(user_id, etc.)**. This JWT is `access token`.

3. Server would send `access token` to client.

4. Client store `access token` to **client-side storage (cookie, local storage, etc.)**.

5. With other next request, client's request would include `access token` in it's **HEADER**.

6. Server would verify `access token` with `secret key` to verify the token's validity.
7. If valid, give access to requested resource. On logout, remove the `access token` in client-side storage.
8. When `access token` is out-of-time, server would reject client's request, client would remove the `access token` in client-side storage and change to logged out stage.
