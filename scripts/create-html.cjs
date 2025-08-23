const fs = require('fs');
const path = require('path');

const buildClientPath = path.join(__dirname, '..', 'build', 'client');

// Read the manifest to get the correct file hashes
const manifestPath = path.join(buildClientPath, '.vite', 'manifest.json');
let manifest = {};

try {
  manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
} catch (error) {
  console.log('Could not read manifest, using default file names');
}

// Get the entry client file name
const entryClient = manifest['app/entry.client.tsx'] || manifest['entry.client.tsx'];
const entryClientFile = entryClient?.file || 'assets/entry.client-BKxvq5QD.js';

// Get the root CSS file name
const rootCSS = manifest['app/root.tsx'] || manifest['root.tsx'];
const cssFiles = rootCSS?.css || ['assets/root-DQlpEH6e.css'];
const cssFile = cssFiles[0] || 'assets/root-DQlpEH6e.css';

const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CIV Church Living IS</title>
    <link rel="icon" type="image/x-icon" href="/CIV-CLivingIS/favicon.ico">
    <link rel="stylesheet" href="/CIV-CLivingIS/${cssFile}">
</head>
<body>
    <div id="root"></div>
    <script type="module" src="/CIV-CLivingIS/${entryClientFile}"></script>
</body>
</html>`;

const notFoundHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CIV Church Living IS</title>
    <link rel="icon" type="image/x-icon" href="/CIV-CLivingIS/favicon.ico">
    <link rel="stylesheet" href="/CIV-CLivingIS/${cssFile}">
    <script>
      // GitHub Pages SPA redirect
      sessionStorage.redirect = location.href;
    </script>
    <meta http-equiv="refresh" content="0;URL='/CIV-CLivingIS/'">
</head>
<body>
    <div id="root"></div>
    <script type="module" src="/CIV-CLivingIS/${entryClientFile}"></script>
</body>
</html>`;

// Write the HTML files
fs.writeFileSync(path.join(buildClientPath, 'index.html'), indexHtml);
fs.writeFileSync(path.join(buildClientPath, '404.html'), notFoundHtml);

console.log('Created index.html and 404.html for GitHub Pages');
console.log(`Using CSS: ${cssFile}`);
console.log(`Using JS: ${entryClientFile}`);