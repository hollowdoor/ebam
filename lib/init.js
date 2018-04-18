const path = require('path');
const inquirer = require('inquirer');
const chalk = require('chalk');
const prettyjson = require('prettyjson');
const extend = require('deep-extend');
const arrayUnion = require('array-union');
const Promise = require('bluebird');
const fs = require('fs');
const writeFile = Promise.promisify(fs.writeFile);
const WARNING = chalk.bold.red('WARNING!');
const cwd = process.cwd();
const log = console.log.bind(console);

module.exports = function init(){
    let packPath = path.join(cwd, 'package.json');
    let pack = require(packPath);

    const keywords = pack.keywords || [];
    pack.scripts = pack.scripts || {};
    pack.scripts.build = 'ebam';
    pack.scripts.test = pack.scripts.test || 'echo "no test"';

    extend(pack, {
        name: pack.name,
        description: pack.description || '',
        keywords: keywords.length ? keywords.join(',') : '',
        version: pack.version || '1.0.0',
        license: pack.license || 'MIT'
    });

    log(`
${chalk.bold(`Please install ebam globally with "npm install -g ebam" if you haven't already.`)}

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
      name    : 'gituser',
      message : 'Provide your github username?',
      store   : true
    },{
      type    : 'input',
      name    : 'keywords',
      message : 'Provide a list of searchable keywords',
      default : pack.keywords
    },{
      type    : 'input',
      name    : 'entry',
      message : 'Tell ebam what file to transpile',
      default : 'src/index.js',
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
     type    : 'confirm',
     name    : 'extraFiles',
     message : 'Create .gitignore, .npmignore files?',
     default : true
   }, {
     type    : 'confirm',
     name    : 'readme',
     message : 'Create README.md file?',
     default : true
   }, {
     type    : 'confirm',
     name    : 'globalInstall',
     message : 'Is this module meant to be global?',
     default : false,
     when(answers){
         return answers.readme;
     }
   }, {
     type    : 'input',
     name    : 'license',
     message : 'Project license?',
     default : pack.license
  }]).then((answers) => {

      const keywords = answers.keywords.length
          ? answers.keywords.split(',').map(s=>s.trim())
          : [];

      extend(pack, {
          name: answers.name,
          description: answers.description,
          ebam: {
              entry: answers.entry,
              transforms: answers.transforms
          },
          license: answers.license
      });

      pack.keywords = arrayUnion(pack.keywords || [], keywords);

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
              if(answers.testBuild){

                  try{
                      fs.writeFileSync(src, '');
                      fs.writeFileSync(path.join(testdir, 'styles.css'), '');
fs.writeFileSync(`<!DOCTYPE html>
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
                  }catch(err){
                      throw err;
                  }
              }

              fs.writeFileSync(packPath, JSON.stringify(pack, null, '  '));
          }
      });
    });
};
