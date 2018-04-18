#!/usr/bin/env node
"use strict";
const meow = require('meow');
const pkgConf = require('pkg-conf');
const getTime = require('./lib/get_time');
const processPackage = require('./lib/process_package.js');
const run = require('./index.js');
const init = require('./lib/init.js');

const cli = meow(`
    Usage
        $ ebam <input>
`, {
    alias: {

    }
});

(function main(){

    if(cli.input[0] === 'init'){
        init();
        return;
    }

    console.log(getTime());

    pkgConf('ebam').then(config=>{

        return processPackage(config)
        .then(pack=>{
            config.name = pack.name;
            config.external = Object.keys(pack.dependencies || {});
            config.transforms = config.transforms || {};
            return config;
        });
    })
    .then(run)
    .catch(err=>{
        throw new Error('ebam error ' + err.message);
    });
}());
