const Promise = require('bluebird');
const writeFile = Promise.promisify(require('fs').writeFile);
const readFile = Promise.promisify(require('fs').readFile);
const path = require('path');
const packagePath = path.join(process.cwd(), "package.json");

module.exports = function initPackage(){
    return readFile(packagePath, 'utf8')
    .then(pack=>JSON.parse(pack))
    .then(pack=>{
        let config = pack['ebam'] || {};
        pack["main"] = "dist/bundle.js";
        pack["jsnext:main"] = "dist/bundle.es.js";
        pack["module"] = "dist/bundle.es.js";

        config.name = pack.name;
        config.external = Object.keys(pack.dependencies || {});
        config.transforms = config.transforms || {};

        return writeFile(packagePath, JSON.stringify(pack, null, '  '))
        .then(()=>pack);
    });
};
