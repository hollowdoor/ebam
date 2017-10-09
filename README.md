ebam
====

Install
------

`npm install -g ebam`

Usage
----

Use [the official yeoman generator](https://github.com/hollowdoor/generator_ebam) for `ebam`, or:

Change directory to where you are authoring your module.

Then run `ebam` on the command line.

`ebam` will create a `dist` folder and these files:

* dist/{moduleName}.js
* dist/{moduleName}.min.js
* dist/bundle.es.js
* dist/bundle.js

Additional source maps are also generated for each file.

`dist/{moduleName}.js`, and `dist/{moduleName}.min.js` are browser ready downloadable builds.

About
----

`ebam` is a wrapper around `rollup` that compiles your es2015 module into something consumable by browsers using the `rollup-plugin-buble` module.

This module is meant to do all the usual things when publishing a browser destined module.

The Config
----------

Use the `ebam` field in your `package.json` to configure `ebam`.

Here is a `package.json` with an `ebam` configuration field.

```JSON
{
  "name": "a-thingy",
  "ebam": {
    "entry": "index.js",
    "test": {
      "src": "test/src.js",
      "dest": "test/code.js"
    },
    "transforms": {
      "dangerousForOf": false,
      "dangerousTaggedTemplateString": false
    }
  },
  "main": "dist/bundle.js",
  "jsnext:main": "dist/bundle.es.js",
  "module": "dist/bundle.es.js"
}
```

**Warning** `ebam` will create *main, jsnext:main, and module* fields in your `package.json`.

The `ebam.transforms` field is just like the transforms options that `buble` accepts. See the `buble` project for more.

The `ebam.test` field is a source (**src**) of a test file, and an output destination (**dest**) for a compiled version. Use the **dest** file to test your module in the browser. This can be used when you aren't using some test automation suit.

Development
--------

For this repo. Clone your fork to you local machine.

Run: `npm install -g && npm run test` **<<-- Warning** this will replace any previous installs of `ebam`.
