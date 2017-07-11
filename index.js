#!/usr/bin/env node
"use strict";
const buble = require('rollup-plugin-buble');
const rollup = require('rollup');
const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const uglify = require('rollup-plugin-uglify');
const meow = require('meow');
const camelcase = require('camelcase');
const pkgConf = require('pkg-conf');
const processPackage = require('./lib/process_package.js');
const hasTest = require('./lib/has_test');
const getTime = require('./lib/get_time');
const log = console.log;

console.log(getTime());

const cli = meow(`
    Usage
        $ ebam <input>
`, {
    alias: {

    }
});

pkgConf('ebam').then(config=>{

    processPackage()
    .then(pack=>{
        config.name = pack.name;
        config.external = Object.keys(pack.dependencies || {});
        config.transforms = config.transforms || {};
        return main(config);
    })
    .catch(err=>{
        throw new Error('ebam error ' + err.message);
    });
});

function main(config){

    rollup.rollup({
        entry: config.entry,
        plugins: getPlugins({transforms: config.transforms}),
        external: config.external
    }).then((bundle)=>{

        let a = bundle.write({
            dest: 'dist/bundle.js',
            format: 'cjs',
            moduleName: config.name,
            sourceMap: true
        });

        let b = bundle.write({
            dest: 'dist/bundle.es.js',
            format: 'es',
            sourceMap: true
        });
        return Promise.all([a, b]).then(()=>{
            log(`Generated dist/bundle.js`);
            log(`Generated dist/bundle.es.js`);
        });
    }).catch(onErrorCB('bundle'));

    //Browser ready builds
    rollup.rollup({
        entry: config.entry,
        plugins: getPlugins([], config),
    }).then((bundle)=>{
        return bundle.write({
            dest: `dist/${config.name}.js`,
            format: 'iife',
            sourceMap: true,
            moduleName: camelcase(config.name)
        }).then(()=>log(`Generated dist/${config.name}.js`));
    }).catch(onErrorCB('script sources'));

    rollup.rollup({
        entry: config.entry,
        plugins: getPlugins([uglify()], config),
    }).then((bundle)=>{
        return bundle.write({
            dest: `dist/${config.name}.min.js`,
            format: 'iife',
            sourceMap: true,
            moduleName: camelcase(config.name)
        }).then(()=>log(`Generated dist/${config.name}.min.js`));
    }).catch(onErrorCB('script sources'));

    if(hasTest(config)){
        rollup.rollup({
            entry: config.test.src,
            plugins: getPlugins([], config)
        }).then(bundle=>{
            bundle.write({
                dest: config.test.dest,
                format: 'iife',
                sourceMap: true,
                moduleName: camelcase(config.name)
            }).then(()=>log(`Generated ${config.test.dest}`));
        }).catch(onErrorCB('test code'));
    }

    function getPlugins(extraPlugins = [], {
        ignore = [],
        transforms = {}
    } = {}){
        return [
            nodeResolve({
                jsnext: true,
                main: true,
                module: true
            }),
            commonjs({
                ignore: ignore
            }),
            buble({
                transforms: transforms
            })
        ].concat(extraPlugins);
    }

    function onErrorCB(message){
        return function(e){
            if(e){
                if(message)
                    console.log(message);
                throw new Error('ebam error '+e);
                //console.log(e);
                //console.log(e.stack);
            }
        };
    }

}
