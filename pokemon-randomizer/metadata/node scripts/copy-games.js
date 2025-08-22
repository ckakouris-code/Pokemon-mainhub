import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

// Directory containing your metadata files
const directory = process.cwd();

// Load the source file
const sourcePath = path.join(directory, 'metadata-all.json');
const sourceData = JSON.parse(readFileSync(sourcePath, 'utf8'));

// Find all metadata-*.json files except metadata-all.json
import { readdirSync } from 'fs';
const files = readdirSync(directory)
  .filter(f => f.startsWith('metadata-') && f.endsWith('.json') && f !== 'metadata-all.json');

for (const file of files) {
  const filePath = path.join(directory, file);
  const targetData = JSON.parse(readFileSync(filePath, 'utf8'));

  // Copy the "games" array for each Pokémon, if present in source
  for (const [name, mon] of Object.entries(targetData)) {
    if (sourceData[name] && sourceData[name].games) {
      mon.games = [...sourceData[name].games];
    }
  }

  writeFileSync(filePath, JSON.stringify(targetData, null, 2));
  console.log(`Copied games arrays to ${file}`);
}

console.log('Done copying games arrays to all metadata files.');