#!/usr/bin/env node
"use strict";
const run = require('./index.js');
const init = require('./lib/init.js');

(function main(){

    const cli = run.cliInit();

    if(cli.flags.help){
        console.log(cli.help);
        return;
    }

    run.showTime();

    if(cli.input[0] === 'init'){
        return init();
    }

    return run.initPackage().then(pack=>{
        return run(pack.ebam);
    });
}())
.catch(err=>{
    throw new Error('ebam error ' + err.message);
});
