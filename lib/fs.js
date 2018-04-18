const fs = require('fs');

module.exports = class FS {
    constructor({
        inquirer = null
    } = {}){
        this.inquirer = inquirer;
        this.prompts = [];
    }
    start(){
        this.inquirer.prompt(this.prompts);
    }
    copyTpl(){

    }
    createFile(name){
        this.inquirer.prompt([

        ]).then(answers=>{

        });
    }
}
