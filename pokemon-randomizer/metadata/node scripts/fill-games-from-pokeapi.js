import { readFileSync, writeFileSync } from 'fs';
import fetch from 'node-fetch';
import path from 'path';

const metadataPath = path.join(process.cwd(), 'metadata games list', 'metadata-all.json');
const metadata = JSON.parse(readFileSync(metadataPath, 'utf8'));

function normalize(name) {
  return name
    .toLowerCase()
    .replace(/♀/g, '-f')
    .replace(/♂/g, '-m')
    .replace(/é/g, 'e')
    .replace(/’/g, '')
    .replace(/'/g, '')
    .replace(/[\s.]/g, '')
    .replace(/[^a-z0-9-]/g, '');
}

async function getGameIndices(pokemonName) {
  try {
    const url = `https://pokeapi.co/api/v2/pokemon/${pokemonName}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    // Extract unique version names
    return Array.from(new Set(data.game_indices.map(idx => idx.version.name)));
  } catch (e) {
    return [];
  }
}

async function main() {
  let changed = false;
  for (const [name, meta] of Object.entries(metadata)) {
    const pokeapiName = normalize(name)
      .replace('-f', '-f')
      .replace('-m', '-m')
      .replace(/[^a-z0-9-]/g, '');
    const games = await getGameIndices(pokeapiName);
    if (games.length > 0) {
      meta.games = games.sort();
      changed = true;
      console.log(`Set games for ${name}:`, meta.games);
    } else {
      meta.games = [];
      console.log(`No games found for ${name}`);
    }
    // To avoid rate limits, wait a bit between requests
    await new Promise(r => setTimeout(r, 200));
  }
  if (changed) {
    writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    console.log('Filled games arrays with natural availability!');
  } else {
    console.log('No changes made.');
  }
}

main();