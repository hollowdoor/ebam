#!/usr/bin/env node
"use strict";
const getTime = require('./lib/get_time');
const run = require('./index.js');
const init = require('./lib/init.js');
const cliInit = require('./lib/cli_init.js');


(function main(){

    run.cliInit().then(cmd=>{
        const cli = cmd.cli;

        if(cli.flags.help){
            console.log(cli.help);
            return;
        }

        if(cli.input[0] === 'init'){
            init();
            return;
        }
        console.log(getTime());
        return run(cmd.config);
    })
    .catch(err=>{
        throw new Error('ebam error ' + err.message);
    });
}());
