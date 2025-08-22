import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const metadataPath = path.join(process.cwd(), 'metadata-all.json');
const metadata = JSON.parse(readFileSync(metadataPath, 'utf8'));

// Map: file name => games to add (customize as needed)
const gameFiles = [
  { file: 'sunandmoon.txt', games: ['sun', 'moon'] },
  { file: 'ultrasunultramoon.txt', games: ['ultrasun', 'ultramoon'] },
  { file: 'letsgames.txt', games: ['letsgopikachu', 'letsgoeevee'] },
  { file: 'swordshield.txt', games: ['sword', 'shield'] },
  { file: 'brilliantdiamondshiningpearl.txt', games: ['brilliantdiamond', 'shiningpearl'] },
  { file: 'legendsarceus.txt', games: ['legendsarceus'] },
  { file: 'scarletviolet.txt', games: ['scarlet', 'violet'] }
];

// Helper: Find all metadata keys that match a base name or form
function findMatchingKeys(name) {
  const matches = [];
  for (const key of Object.keys(metadata)) {
    if (key === name) matches.push(key);
    // If the line is a base name, also match forms that start with base name + '-'
    if (!name.includes('-') && key.startsWith(name + '-')) matches.push(key);
  }
  return matches;
}

console.log('Looking for files in:', gameListsDir);

for (const { file, games } of gameFiles) {
  const filePath = path.join(gameListsDir, file);
  if (!existsSync(filePath)) {
    console.warn(`Missing file: ${filePath}`);
    continue;
  }
  const lines = readFileSync(filePath, 'utf8').split('\n').map(l => l.trim().toLowerCase()).filter(Boolean);

  for (const line of lines) {
    const keys = findMatchingKeys(line);
    for (const key of keys) {
      if (!metadata[key].games) metadata[key].games = [];
      for (const game of games) {
        if (!metadata[key].games.includes(game)) {
          metadata[key].games.push(game);
        }
      }
    }
  }
}

writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
console.log('Missing Gen 7+ games filled in, including forms!');