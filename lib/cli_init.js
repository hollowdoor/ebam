const meow = require('meow');
const pkgConf = require('pkg-conf');
const processPackage = require('./process_package.js');

module.exports = function cliInit(usecli = true){
    const cli = usecli ? meow(`
        Usage
            $ ebam <input>
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
