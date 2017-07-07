const Promise = require('bluebird');
const writeFile = Promise.promisify(require('fs').writeFile);
const readFile = Promise.promisify(require('fs').readFile);
const path = require('path');
const packagePath = path.join(process.cwd(), "package.json");

module.exports = function processPackage(){
    return readFile(packagePath, 'utf8')
    .then(pack=>JSON.parse(pack))
    .then(pack=>{
        pack["main"] = "dist/bundle.js";
        pack["jsnext:main"] = "dist/bundle.es.js";
        pack["module"] = "dist/bundle.es.js";
        return writeFile(packagePath, JSON.stringify(pack, null, '  '))
        .then(()=>pack);
    });
};
