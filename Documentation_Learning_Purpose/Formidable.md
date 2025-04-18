# npm install formidable (dt)
## dt: seperate package for TypeScript
## Formidable's notes
* ES Modules: `import ABC from 'ABC'`
* CommonJS:   `const ABC = require('ABC')`

While we are using `import`, it is still `require()`. NodeJS just support casting from `import` to `require()`.

Conclusion, we are using `require()` on **ES Modules**.

**Formidable v3 - ESModules, Monorepo structure** 

**Solution:** `const formidable = (await import ('formidable')).default`

But `formidable` now fully support `ES Modules (ESM)`