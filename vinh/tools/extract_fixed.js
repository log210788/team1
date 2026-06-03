const fs = require('fs');
const path = require('path');
const { PDFParse } = require('./node_modules/pdf-parse');

const pdfPath = path.join(__dirname, '..', 'English phonetics and phonology _ a practical course -- Peter Roach, Roach, Peter, Peter Roach -- 3 edition, January 8, 2001 -- Cambridge University -- isbn13 9780521008525 -- 7d46cea21457b7b2e1d0cfd52255532e -- .pdf');
const dataBuffer = fs.readFileSync(pdfPath);

async function run() {
  try {
    const parser = new PDFParse({ data: dataBuffer });
    console.log('Starting text extraction...');
    const result = await parser.getText();
    console.log('Successfully extracted! Length:', result.text.length);
    
    // Save the text to tools/extracted_text.txt
    fs.writeFileSync(path.join(__dirname, 'extracted_text.txt'), result.text);
    console.log('Saved extracted_text.txt');
  } catch (err) {
    console.error('Error in run:', err);
  }
}
run();
