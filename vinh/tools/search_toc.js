const fs = require('fs');
const path = require('path');
const { PDFParse } = require('./node_modules/pdf-parse');

const pdfPath = path.join(__dirname, '..', 'English phonetics and phonology _ a practical course -- Peter Roach, Roach, Peter, Peter Roach -- 3 edition, January 8, 2001 -- Cambridge University -- isbn13 9780521008525 -- 7d46cea21457b7b2e1d0cfd52255532e -- .pdf');
const dataBuffer = fs.readFileSync(pdfPath);

async function extract() {
  const parser = new PDFParse({ data: dataBuffer });
  const result = await parser.getText();
  
  // Find where Contents is
  const lines = result.text.split('\n');
  console.log('Total lines:', lines.length);
  
  // Search for Chapters or Contents
  console.log('--- CHAPTERS AND CONTENTS FOUND ---');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.match(/^chapter/i) || line.match(/^contents/i) || (line.match(/^\d+\s+[A-Z][a-z]+/)) && line.length < 50) {
      // Print line and line number
      if (line.toLowerCase().includes('chapter') || line.toLowerCase().includes('contents')) {
        console.log(`Line ${i}: ${line}`);
      }
    }
  }
}
extract();
