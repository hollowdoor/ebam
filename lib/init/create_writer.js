const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');
const fileExists = require('file-exists');
const makeDir = require('make-dir');
const writeFile = Promise.promisify(fs.writeFile);

module.exports = function createWriter(){
    const tasks = [];
    const writeNext = function(name, contents){
        tasks.push(
            writeFile(name, contents)
            .then(v=>{
                console.log(`Created ${name} file`);
            })
        );
    };

    const writer = {
        writeFile: writeNext,
        write(name, contents = ''){
            let dir = path.dirname(name);
            let base = path.basename(name);
            name = path.join(dir, base);
            
            return makeDir(dir)
            .then(v=>{
                return fileExists(name)
                .then(v=>{
                    if(v) return;
                    writeNext(name, contents);
                });
            });
        },
        done(){
            return Promise.all(tasks);
        }
    };

    return writer;
};
