#!/usr/bin/env node
"use strict";
const meow = require('meow');
const pkgConf = require('pkg-conf');
const getTime = require('./lib/get_time');
const processPackage = require('./lib/process_package.js');
const run = require('./index.js');

const cli = meow(`
    Usage
        $ ebam <input>
`, {
    alias: {

    }
});

console.log(getTime());

pkgConf('ebam').then(config=>{

    return processPackage()
    .then(pack=>{
        config.name = pack.name;
        config.external = Object.keys(pack.dependencies || {});
        config.transforms = config.transforms || {};
        return config;
    });
})
.then(run)
.catch(err=>{
    throw new Error('ebam error ' + err);
});
