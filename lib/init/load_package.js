const extend = require('deep-extend');
const path = require('path');
const cwd = process.cwd();


function createPack(pack){
    const add = (o, name, val)=>o[name] = o[name] !== void 0 ? o[name] : val;

    add(pack, 'keywords', []);
    add(pack, 'description', '');
    add(pack, 'version', '1.0.0');
    add(pack, 'license', 'MIT');

    add(pack, 'ebam', {});
    add(pack.ebam, 'input', 'src/index.js');

    add(pack, 'scripts', {});
    add(pack.scripts, 'test', 'echo "no test"');
    add(pack.scripts, 'build', 'ebam');

    return pack;
}

module.exports = function loadPackage(){
    let packPath = path.join(cwd, 'package.json');
    let pack = createPack(require(packPath));

    return {
        pack,
        config: pack.ebam,
        packPath
    };
};

/*module.exports = function loadPackage(){
    let packPath = path.join(cwd, 'package.json');
    let pack = require(packPath);
    let config = pack.ebam || {};

    const keywords = pack.keywords
    ? pack.keywords
    : [];
    pack.scripts = pack.scripts || {};
    pack.scripts.test = pack.scripts.test || 'echo "no test"';
    pack.scripts.build = pack.scripts.build
    ? pack.scripts.build
    : 'ebam';

    extend(pack, {
        name: pack.name,
        description: pack.description || '',
        keywords,
        version: pack.version || '1.0.0',
        license: pack.license || 'MIT'
    });

    config.input = config.input || 'src/index.js';


    return {
        pack,
        config,
        packPath
    };
};*/
