import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

// Input file: raw dump from Serebii/Bulbapedia/Veekun, one Pokémon per line
const inputPath = path.join(process.cwd(), 'raw-dex.txt');
// Output file: just dex number and name
const outputPath = path.join(process.cwd(), 'dex-names.txt');

const lines = readFileSync(inputPath, 'utf8').split('\n');
const output = [];

for (const line of lines) {
  // Match lines that start with a dex number (optionally padded with zeros), then a name
  const match = line.match(/^\s*(\d{1,4})\s+([a-zA-Z0-9\-'.♀♂ ]+)/);
  if (match) {
    // Normalize name: lowercase, spaces to dashes, remove extra whitespace
    const dexNum = match[1].padStart(3, '0');
    const name = match[2].trim().toLowerCase().replace(/\s+/g, '-');
    output.push(`${dexNum} ${name}`);
  }
}

writeFileSync(outputPath, output.join('\n'));
console.log(`Extracted ${output.length} Pokémon to ${outputPath}`);