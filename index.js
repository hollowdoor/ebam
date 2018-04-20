"use strict";
const buble = require('rollup-plugin-buble');
const rollup = require('rollup');
const nodeResolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const uglify = require('rollup-plugin-uglify');
const camelcase = require('camelcase');
const hasTest = require('./lib/has_test');
const cliInit = require('./lib/cli_init.js');
const initPackage = require('./lib/init_package.js');
const getTime = require('./lib/get_time');
const log = console.log.bind(console);

module.exports = function main(config){

    let input = config.input || config.entry;

    let a = rollup.rollup({
        input,
        plugins: getPlugins({transforms: config.transforms}),
        external: config.external
    }).then((bundle)=>{

        let a = bundle.write({
            file: 'dist/bundle.js',
            format: 'cjs',
            name: config.name,
            sourcemap: true
        });

        let b = bundle.write({
            file: 'dist/bundle.es.js',
            format: 'es',
            sourcemap: true
        });
        return Promise.all([a, b]).then(()=>{
            log(`Generated dist/bundle.js`);
            log(`Generated dist/bundle.es.js`);
        });
    }).catch(onErrorCB('bundle'));

    //Browser ready builds
    let b = rollup.rollup({
        input,
        plugins: getPlugins([], config),
    }).then((bundle)=>{
        return bundle.write({
            file: `dist/${config.name}.js`,
            format: 'iife',
            sourcemap: true,
            name: camelcase(config.name)
        }).then(()=>log(`Generated dist/${config.name}.js`));
    }).catch(onErrorCB('script sources'));

    let c = rollup.rollup({
        input,
        plugins: getPlugins([uglify()], config),
    }).then((bundle)=>{
        return bundle.write({
            file: `dist/${config.name}.min.js`,
            format: 'iife',
            sourcemap: true,
            name: camelcase(config.name)
        }).then(()=>log(`Generated dist/${config.name}.min.js`));
    }).catch(onErrorCB('script sources'));

    Promise.all([a, b, c]).then(v=>{

        if(hasTest(config)){
            rollup.rollup({
                input: config.test.src,
                plugins: getPlugins([], config)
            }).then(bundle=>{
                bundle.write({
                    file: config.test.dest,
                    format: 'iife',
                    sourcemap: true,
                    name: camelcase(config.name)
                }).then(()=>log(`Generated ${config.test.dest}`));
            }).catch(onErrorCB('test code'));
        }
    });


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

    function onErrorCB(message = ''){
        return function(e){
            if(e){
                throw new Error('ebam error for '+message+' -->\n'+e.message);
            }
        };
    }

}

module.exports.cliInit = cliInit;
module.exports.initPackage = initPackage;
module.exports.showTime = function(){
    console.log(getTime());
};
