import { readFileSync, writeFileSync, existsSync } from 'fs';
import path from 'path';

const metadataPath = path.join(process.cwd(), 'metadata-all.json');
const gameListsDir = process.cwd(); // Looks in the current directory
const metadata = JSON.parse(readFileSync(metadataPath, 'utf8'));

// Map: file name => games to add (customize as needed)
const gameFiles = [
  { file: 'letsgames.txt', games: ['letsgopikachu', 'letsgoeevee'] },
  { file: 'legendsarceus.txt', games: ['legendsarceus'] },
  { file: 'scarletviolet.txt', games: ['scarlet', 'violet'] },
  { file: 'sunandmoon.txt', games: ['sun', 'moon'] },
  { file: 'ultrasunultramoon.txt', games: ['ultrasun', 'ultramoon'] },
  { file: 'bdsp.txt', games: ['brilliantdiamond', 'shiningpearl'] },
  { file: 'swordshield.txt', games: ['sword', 'shield'] }
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

for (const { file, games } of gameFiles) {
  const filePath = path.join(gameListsDir, file);
  if (!existsSync(filePath)) {
    console.warn(`Missing file: ${filePath}`);
    continue;
  }
  const lines = readFileSync(filePath, 'utf8')
  .split('\n')
  .map(l => l.replace(/,/g, '').trim().toLowerCase())
  .filter(Boolean);

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

//# sourceMappingURL=fill-mainline-games.js.map