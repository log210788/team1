const fs = require('fs');
const path = require('path');
const vm = require('vm');

const htmlPath = path.join(__dirname, '..', 'Tutor_Dashboard.html');
const htmlContent = fs.readFileSync(htmlPath, 'utf8');

// Simple regex to extract scripts
const scriptRegex = /<script>([\s\S]*?)<\/script>/gi;
let match;
let count = 0;

console.log('Validating HTML scripts...');

while ((match = scriptRegex.exec(htmlContent)) !== null) {
  count++;
  const jsContent = match[1];
  try {
    // Attempt to parse/compile the script using node's vm module
    new vm.Script(jsContent);
    console.log(`Script tag #${count} is syntactically valid!`);
  } catch (err) {
    console.error(`Syntax error in script tag #${count}:`, err.message);
    // Find line number
    const linesUpTo = htmlContent.substring(0, match.index).split('\n');
    console.error(`Approximate line in HTML: ${linesUpTo.length}`);
    process.exit(1);
  }
}

if (count === 0) {
  console.log('No script tags found.');
} else {
  console.log('All scripts validated successfully!');
}
