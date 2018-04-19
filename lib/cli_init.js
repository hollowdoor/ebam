const meow = require('meow');
const pkgConf = require('pkg-conf');
const processPackage = require('./process_package.js');

module.exports = function cliInit(usecli = true){
    const cli = usecli ? meow(`
        Usage
            $ ebam <input>

        Options
            --help Show help

        Examples
            $ ebam init
                Sets up configuration for ebam
    `, {
        alias: {

        }
    }) : null;

    return pkgConf('ebam').then(config=>{

        return processPackage(config)
        .then(pack=>{
            config.name = pack.name;
            config.external = Object.keys(pack.dependencies || {});
            config.transforms = config.transforms || {};
            return {cli, config};
        });
    });
};
