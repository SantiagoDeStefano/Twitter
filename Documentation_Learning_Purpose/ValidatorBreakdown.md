## Using checkSchema from express-validator
```
export declare const checkSchema: 
<T extends string = DefaultSchemaKeys>
(
  schema: Schema<T>, 
  defaultLocations?: Location[]
) 
=> RunnableValidationChains<ValidationChain>;
```

- `T extends string` means T must be a string type.
  
- `= DefaultSchemaKeys` sets a default type for T if the caller doesn’t provide one.

- `schema: Schema<T>` ensures that the `schema` parameter follow a structure where keys are of type T

```
export const validate = (
  validations: RunnableValidationChains<ValidationChain>
) => {}
```
**`RunnableValidationChains<ValidationChain>`** ensures type safety by enforcing that the provided validation rules match the structure expected from checkSchema()

**The code is understandable, but what is ErrorWithStatus?**

```
type ErrorsType = Record<
  string, // Key: any string
  {       // Value: an object with:
    msg: string  // Required field "msg" of type string
    [key: string]: any  // Additional dynamic properties of any type
  }
>
```
For example:
```
const errors: ErrorsType = {
  email: { msg: "Invalid email format", location: "body" },
  password: { msg: "Password must be at least 6 characters", location: "body" }
};
```
**`ErrorWithStatus`** is a **generic error class** that represent **any HTTP error**.

**`EntityError`** extends `ErrorWithStatus`, adds an `errors` object to store multiple field-specific validation errors.

- Used for form validation failures, missing required fields, or invalid data formats.
