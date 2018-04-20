const meow = require('meow');
const pkgConf = require('pkg-conf');
//const processPackage = require('./process_package.js');


module.exports = function cliInit(usecli = true){
    return meow(`
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
    });
};
