const fs = require('fs');
const path = require('path');
const { PDFParse } = require('./node_modules/pdf-parse');

const pdfPath = path.join(__dirname, '..', 'English phonetics and phonology _ a practical course -- Peter Roach, Roach, Peter, Peter Roach -- 3 edition, January 8, 2001 -- Cambridge University -- isbn13 9780521008525 -- 7d46cea21457b7b2e1d0cfd52255532e -- .pdf');
const dataBuffer = fs.readFileSync(pdfPath);

async function test() {
  try {
    const parser = new PDFParse({ data: dataBuffer });
    console.log('Instance created with data!');
    const result = await parser.getText();
    console.log('Successfully got text! Length:', result.text.length);
    console.log('First 500 chars:', result.text.substring(0, 500));
  } catch (e) {
    console.error('Error with data:', e);
  }
}
test();
