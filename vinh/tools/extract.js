const fs = require('fs');
const path = require('path');
const { PDFParse } = require('./node_modules/pdf-parse');

const pdfPath = path.join(__dirname, '..', 'English phonetics and phonology _ a practical course -- Peter Roach, Roach, Peter, Peter Roach -- 3 edition, January 8, 2001 -- Cambridge University -- isbn13 9780521008525 -- 7d46cea21457b7b2e1d0cfd52255532e -- .pdf');

const dataBuffer = fs.readFileSync(pdfPath);

const parser = new PDFParse();
parser.parse(dataBuffer).then(function(data) {
  const text = data.text || data;
  const outText = typeof text === 'string' ? text : JSON.stringify(text).substring(0, 5000);
  fs.writeFileSync(path.join(__dirname, 'book_full.txt'), outText);
  console.log('Done! Total chars:', outText.length);
  console.log('--- PREVIEW ---');
  console.log(outText.substring(0, 2000));
}).catch(err => {
  console.log('Error:', err.message);
  // Try alternate approach
  console.log('Data keys:', Object.keys(data || {}));
});
