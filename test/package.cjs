const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const path = require('node:path');

const projectRoot = path.resolve(__dirname, '..');
const packOutput = execFileSync('npm', ['pack', '--dry-run', '--json'], {
  cwd: projectRoot,
  encoding: 'utf8',
});
const packageFiles = new Set(JSON.parse(packOutput)[0].files.map(file => file.path));

assert(packageFiles.has('dist/index.min.js.map'), 'The package must include the minified bundle source map');
assert(packageFiles.has('CHANGELOG.md'), 'The package must include the changelog');

console.log('Package contents passed');
