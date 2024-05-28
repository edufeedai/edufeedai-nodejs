const fs = require('fs');
const path = require('path');

function addJsExtension(filePath) {
  const data = fs.readFileSync(filePath, 'utf8');
  const result = data.replace(/(from\s+['"])(\.\/[^'"]+)(['"])/g, '$1$2.js$3');
  fs.writeFileSync(filePath, result, 'utf8');
}

function processDirectory(directory) {
  fs.readdirSync(directory).forEach(file => {
    const fullPath = path.join(directory, file);
    if (fs.lstatSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.js')) {
      addJsExtension(fullPath);
    }
  });
}

processDirectory(path.join(__dirname, 'dist'));
console.log('Fixed imports in compiled JavaScript files.');
