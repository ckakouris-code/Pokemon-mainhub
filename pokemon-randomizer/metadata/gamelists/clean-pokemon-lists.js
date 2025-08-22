import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

// Change this to your input file (raw copy-paste from Serebii/Bulbapedia)
const inputFile = path.join(process.cwd(), 'rawlist.txt');
// Change this to your desired output file
const outputFile = path.join(process.cwd(), 'cleanedlist.txt');

function normalize(name) {
  return name
    .toLowerCase()
    .replace(/♀/g, '♀')
    .replace(/♂/g, '♂')
    .replace(/é/g, 'e')
    .replace(/’/g, '')
    .replace(/'/g, '')
    .replace(/[\s.]/g, '')
    .replace(/[^a-z0-9♀♂-]/g, '');
}

const raw = readFileSync(inputFile, 'utf8');

// Split on newlines or commas, trim, remove empty lines
const names = raw
  .split(/[\n,]/)
  .map(line => line.trim())
  .filter(Boolean);

// Remove duplicates and normalize
const unique = Array.from(new Set(names.map(n => normalize(n)))).sort();

// Write to output file, one name per line
writeFileSync(outputFile, unique.join('\n'), 'utf8');
console.log(`Wrote ${unique.length} cleaned names to ${outputFile}`);