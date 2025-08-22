const fs = require('fs');
const path = require('path');

const metadataDir = __dirname;
const allPath = path.join(metadataDir, 'metadata-all.json');
const allData = JSON.parse(fs.readFileSync(allPath, 'utf8'));

fs.readdirSync(metadataDir).forEach(file => {
  if (!file.endsWith('.json') || file === 'metadata-all.json') return;
  const filePath = path.join(metadataDir, file);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  let changed = false;

  for (const [poke, meta] of Object.entries(data)) {
    if (allData[poke]) {
      if (meta.id !== allData[poke].id) {
        meta.id = allData[poke].id;
        changed = true;
      }
      if (
        !meta.games ||
        meta.games.length !== allData[poke].games.length ||
        !meta.games.every(g => allData[poke].games.includes(g))
      ) {
        meta.games = [...allData[poke].games];
        changed = true;
      }
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Updated: ${file}`);
  }
});

console.log('Done!');