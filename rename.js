const fs = require('fs');
const path = require('path');

const dirsToScan = ['src', 'ios', 'android', 'tools', 'docs'];
const filesToScan = ['README.md', 'package.json', 'angular.json', 'manifest.webmanifest'];
const root = 'f:/signwave';

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Replacements
    content = content.replace(/Sign Translate/g, 'SignWave');
    content = content.replace(/sign\.mt/g, 'signwave.com');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated: ${filePath}`);
    }
  } catch (e) {
    // Ignore non-text files or errors
  }
}

function scanDir(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      scanDir(fullPath);
    } else {
      processFile(fullPath);
    }
  }
}

for (const dir of dirsToScan) {
  scanDir(path.join(root, dir));
}
for (const file of filesToScan) {
  const fullPath = path.join(root, file);
  if (fs.existsSync(fullPath)) {
    processFile(fullPath);
  }
}

console.log('Renaming complete!');
