import * as path from 'path';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const helpers = require('yeoman-test');

helpers.run(path.join(__dirname, './src/generator/index.ts')).withPrompts({
    someAnswer: true,
});
