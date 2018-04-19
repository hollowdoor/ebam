const path = require('path');
const fs = require('fs');
const Promise = require('bluebird');
const writeFile = Promise.promisify(fs.writeFile);
const inquirer = require('inquirer');
const {mixinSetter} = require('setter-mixin');
const firstMessage = `Do you wish to continue?
If you do not then input Ctrl-c
Hit the enter key to continue
`;


export class Prompts {
    constructor({
        pack = {}
    } = {}){
        this.pack = pack;
        this.prompts = [
            {
              type    : 'input',
              name    : 'create',
              message : firstMessage
            }
        ];
    }
    add(prompt){
        this.prompts.push(prompt);
        return this;
    }
    addAll(list){
        list.forEach(item=>{
            this.add(item);
        });
        return this;
    }
    addField({
        name = '',
        message = '',
        type = 'input',
        filter = null,
        default = ''
    } = {}){

        let val = this.get('pack.'+name);
        default = val !== void 0 ? val : default;

        return this.add({
            name,
            default,
            type,
            filter: filter ? (input)=>{
                return filter.call(this, input);
            } : (input)=>{
                this.set('pack.'+name, input);
                //this.pack[name] = input;
                return input;
            }
        });
    }
    addDirectory({
        name = '',
        message = ''
    } = {}){
        return this.add({
            name,
            massage,
            type: 'confirm',
            filter: (input)=>{
                if(input){
                    return makeDir(name)
                    .then(v=>input);
                }
                return input;
            }
        });
    }
    addFile({
        name = '',
        message = '',
        content = '',
        when = ''
    }= {}){

        return this.add({
            name,
            massage,
            type: 'input',
            when(answers){
                return answers[when];
            },
            filter: (input)=>{
                let parts = input.split('/');
                return writeFile(path.join.apply(path, parts), content)
                .then(v=>input);
            }
        });
    }
    addFields(list){
        list.forEach(item=>{
            this.addField(item);
        });
        return this;
    }
}

mixinSetter(Prompts.prototype);
