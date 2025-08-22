import { readFileSync, writeFileSync, readdirSync } from 'fs';
import path from 'path';

const directory = process.cwd();
const sourcePath = path.join(directory, 'metadata-all.json');
const sourceData = JSON.parse(readFileSync(sourcePath, 'utf8'));

// Find all metadata-*.json files except metadata-all.json
const files = readdirSync(directory)
  .filter(f => f.startsWith('metadata-') && f.endsWith('.json') && f !== 'metadata-all.json');

for (const file of files) {
  const filePath = path.join(directory, file);
  const targetData = JSON.parse(readFileSync(filePath, 'utf8'));

  for (const [name, mon] of Object.entries(targetData)) {
    if (sourceData[name] && sourceData[name].games) {
      mon.games = [...sourceData[name].games];
    }
  }

  writeFileSync(filePath, JSON.stringify(targetData, null, 2));
  console.log(`Copied games arrays to ${file}`);
}

console.log('Done copying games arrays to all metadata files.');