const path = require('path');
const inquirer = require('inquirer');
const chalk = require('chalk');
const prettyjson = require('prettyjson');
const extend = require('deep-extend');
const arrayUnion = require('array-union');
const Promise = require('bluebird');
const fs = require('fs');
const fileExists = require('file-exists');
const writeFile = Promise.promisify(fs.writeFile);
const WARNING = chalk.bold.red('WARNING!');
const cwd = process.cwd();
const log = console.log.bind(console);

module.exports = function init(){
    let packPath = path.join(cwd, 'package.json');
    let pack = require(packPath);
    let config = pack.ebam || {};

    let buildScript = pack.scripts && pack.scripts.build
    ? pack.scripts.build
    : 'ebam';

    const keywords = pack.keywords
    ? pack.keywords
    : [];
    pack.scripts = pack.scripts || {};
    pack.scripts.test = pack.scripts.test || 'echo "no test"';

    let defaultInput = config.input || 'src/index.js';

    extend(pack, {
        name: pack.name,
        description: pack.description || '',
        keywords,
        version: pack.version || '1.0.0',
        license: pack.license || 'MIT'
    });

    log(`
After you've used "ebam init" you can use "npm run build" in the current directory.

${WARNING}: ${chalk.bold(`ebam will change the fields
"main", "jsnext:main", and "module" in your package.json.`)}

ebam uses buble to transpile javascript.
See the documentation for the buble js transpiler
${chalk.cyan(`(https://buble.surge.sh/)`)}.

See the documentation for ebam
${chalk.cyan(`(https://github.com/hollowdoor/ebam)`)}.
`);

const firstMessage = `Do you wish to continue?
If you do not then input Ctrl-c
Hit the enter key to continue
`;

    return inquirer.prompt([{
      type    : 'input',
      name    : 'create',
      message : firstMessage
    },{
      type    : 'input',
      name    : 'name',
      message : 'Your project name',
      default : pack.name
    },{
      type    : 'input',
      name    : 'description',
      message : 'Describe your project',
      default : pack.description
    },{
      type    : 'input',
      name    : 'keywords',
      message : 'Provide a list of searchable keywords',
      default : pack.keywords,
      filter(input){

          if(typeof input !== 'string'){
              return input;
          }
          return arrayUnion(
              input.split(',').map(v=>v.trim()),
              keywords
          );
      }
    },{
      type    : 'input',
      name    : 'input',
      message : 'Tell ebam what file to transpile',
      default : defaultInput,
  },{
      type : 'confirm',
      name: 'esmain',
      message: 'Use the ES module as main?',
      default: false
  },{
        type: 'input',
        name: 'build',
        message: 'Edit the package.json scripts.build field?',
        default: buildScript
    },{
      type    : 'confirm',
      name    : 'transforms.dangerousForOf',
      message : 'Enable buble dangerousForOf?',
      default : false
    },{
      type    : 'confirm',
      name    : 'transforms.dangerousTaggedTemplateString',
      message : 'Enable buble dangerousTaggedTemplateString?',
      default : false
    },{
      type    : 'confirm',
      name    : 'testBuild',
      message : 'Do you want ebam to compile tests for the browser? A <test directory>/index.html file will be created.'
    },{
      type    : 'input',
      name    : 'test.dir',
      message : 'Tell ebam what directory to store test files',
      default : 'test',
      when(answers){
          return answers.testBuild;
      }
    },{
      type    : 'input',
      name    : 'test.src',
      message : 'Tell ebam the name of the test file to transpile',
      default : 'src.js',
      when(answers){
          return answers.testBuild;
      }
    },{
      type    : 'input',
      name    : 'test.dest',
      message : 'Tell ebam the name of the transpiled test file',
      default : 'code.js',
      when(answers){
          return answers.testBuild;
      }
   },{
     type    : 'input',
     name    : 'license',
     message : 'Project license?',
     default : pack.license
  }]).then((answers) => {

      extend(pack, {
          name: answers.name,
          description: answers.description,
          ebam: {
              input: answers.input,
              transforms: answers.transforms,
              esmain: answers.esmain
          },
          license: answers.license,
          keywords: answers.keywords,
          scripts: {
              build: answers.build
          }
      });

      let input = path.join(cwd, answers.input);

      let testdir, dest, src, testSrc;


      if(answers.testBuild){
          testSrc = answers.test.dest;
          testdir = answers.test.dir;
          dest = path.join(testdir, answers.test.dest);
          src = path.join(testdir, answers.test.src);

          pack.ebam.test = {
              dest, src
          };
      }

      log('\nThe new package.json contents:');
      log(prettyjson.render(pack, {
          dashColor: 'magenta'
      }));

      return inquirer.prompt([{
        type    : 'confirm',
        name    : 'useEbam',
        message : 'Continue with this package.json configuration?'
      }]).then(answers=>{
          if(answers.useEbam){

              const write = (name, val)=>{
                  try{
                      if(!fileExists.sync(name)){
                          fs.writeFileSync(name, val);
                          console.log(`Created a file at ${name}`);
                      }
                  }catch(e){
                      throw e;
                  }
              };

              try{
                  fs.writeFileSync(packPath, JSON.stringify(pack, null, '  '));
                  console.log(`Created the ${packPath} file`);

              }catch(e){
                  return Promise.reject('package.json creation error: '+e.message);
              }

              try{
                  write(input, '');
              }catch(e){
                  return Promise.reject('input creation error '+e.message);
              }

              if(answers.testBuild){

                  try{

                      write(src, '');
                      write(path.join(testdir, 'styles.css'), '');
write(path.join(testdir, 'index.html'), `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Test file!</title>
   <link rel="stylesheet" type="text/css" href="styles.css">
</head>
<body>
  <script src="${testSrc}"></script>
</body>
</html>`);
                    }catch(e){
                      return Promise.reject('Test build creation error: '+e.message);
                  }
              }

          }
      });
    });
};