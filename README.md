ebam
====

Install
------

`npm install -g ebam`

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Contents**

- [Usage](#usage)
  - [The programmatic interface](#the-programmatic-interface)
- [Versions](#versions)
  - [Version 2](#version-2)
- [About](#about)
- [The Config](#the-config)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

Usage
----

Change directory to where you are authoring your module.

Run `ebam init` to automatically create an ebam project with config fields in the package.json file. You should also run `npm init`. You can run `npm init` before, or after `ebam init`. Ideally `ebam init` won't step on any fields created by `npm init`, and vise versa.

Then run `ebam` on the command line to build your project.

`ebam` will create a `dist` folder and these files:

* dist/{moduleName}.js
* dist/{moduleName}.min.js
* dist/bundle.es.js
* dist/bundle.js

Additional source maps are also generated for each file.

`dist/{moduleName}.js`, and `dist/{moduleName}.min.js` are browser ready downloadable builds.

### The programmatic interface

Install locally using `npm install ebam`.

Create a build file in your project's directory:

```javascript
const ebam = require('ebam');
//Build your project
ebam({
    "input": "index.js",
    "test": {
      "src": "test/src.js",
      "dest": "test/code.js"
    },
    "transforms": {
      "dangerousForOf": false,
      "dangerousTaggedTemplateString": false
    }
})
.then(v=>console.log('All done!'))
.catch(e=>console.error(e));
```

You can also get the package config automatically.

```javascript
const ebam = require('ebam');
//Build your project
ebam.initPackage().then(pack=>{
    //pack is the package.json object
    return ebam(pack.ebam);
})
.then(v=>console.log('All done!'))
.catch(e=>console.error(e));
```

Versions
----

There are no notes for version 1.

### Version 2

Version 1 uses an `ebam.input` field instead of `ebam.entry`. Old configuration should still work.

Version 2 uses the `ebam init` command instead of relying on a yeoman generator. The yeoman generator should still be useful, but it's use is being phase out.

The code base is somewhat cleaner for ebam under version 2.

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
    "input": "index.js",
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
