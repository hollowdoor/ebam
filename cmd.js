#!/usr/bin/env node
"use strict";
const getTime = require('./lib/get_time');
const run = require('./index.js');
const init = require('./lib/init.js');

(function main(){

    const cli = run.cliInit();

    if(cli.flags.help){
        console.log(cli.help);
        return;
    }

    if(cli.input[0] === 'init'){
        init();
        return;
    }

    run.initPackage().then(pack=>{
        console.log(getTime());
        return run(pack.ebam);
    })
    .catch(err=>{
        throw new Error('ebam error ' + err.message);
    });
}());
