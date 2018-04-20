const path = require('path');
const inquirer = require('inquirer');
const chalk = require('chalk');
const prettyjson = require('prettyjson');
const extend = require('deep-extend');
const arrayUnion = require('array-union');
const createWriter = require('./init/create_writer.js');
const WARNING = chalk.bold.red('WARNING!');
const cwd = process.cwd();
const log = console.log.bind(console);
const loadPackage = require('./init/load_package.js');

module.exports = function init(){
    let {pack, config, packPath} = loadPackage();

    let buildScript = pack.scripts.build;
    let defaultInput = config.input;

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
      message : 'Do you want ebam to compile tests for the browser? A <test directory>/index.html file will be created.',
      default : true
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
    }]).then(answers2=>{
          if(answers2.useEbam){

              const writer = createWriter();
              const { write } = writer;

              writer.writeFile(
                  packPath,
                  JSON.stringify(pack, null, '  ')
              );

              write(input, '');

              if(answers.testBuild){

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
              }

              return writer.done();

          }
      });
    });
};
