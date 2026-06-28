const path = require('path');
const fs = require('fs');

console.log('__dirname:', __dirname);
console.log('Resolved path ../../frontend/out:', path.resolve(__dirname, '../../frontend/out'));
console.log('Exists:', fs.existsSync(path.resolve(__dirname, '../../frontend/out')));

console.log('\nRoot directories:');
const rootDir = path.resolve(__dirname, '../..');
try {
  console.log(fs.readdirSync(rootDir));
} catch (e) {
  console.log('Error reading root:', e.message);
}

console.log('\nServer directories:');
try {
  console.log(fs.readdirSync(path.resolve(__dirname, '..')));
} catch (e) {
  console.log('Error reading server:', e.message);
}
