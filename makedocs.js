const grok = require('@ui-js/grok')['grok'];
const path = require('path');
const fs = require('fs');

const options = {
    input: ['./src/model/docs.ts'],
    // templateFile: './ui/docs/docs.html',
    outFile: './dist/docs.html'
};

// const templateData = fs.readFileSync(path.normalize(options.templateFile), 'utf8');

const grokOptions = {
    sdkName: 'module',
    exclude: [],
    tutorialPath: '',
    externalReferences: {},
    documentTemplate: `{{content}}`
};

let paths = options.input.map(p => path.normalize(p));
let result = grok(paths, grokOptions);

fs.writeFileSync(path.normalize(options.outFile), result['index.html'], 'utf-8');
console.log('Written docs to', options.outFile);
