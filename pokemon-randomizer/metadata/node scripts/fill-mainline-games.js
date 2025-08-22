import { readFileSync, writeFileSync } from 'fs';
import fetch from 'node-fetch';
import path from 'path';

const metadataPath = path.join(process.cwd(), 'metadata-all.json');
const metadata = JSON.parse(readFileSync(metadataPath, 'utf8'));

// Map PokéAPI version names to your canonical game names
const versionMap = {
  'red': 'red',
  'blue': 'blue',
  'yellow': 'yellow',
  'green': 'green',
  'gold': 'gold',
  'silver': 'silver',
  'crystal': 'crystal',
  'ruby': 'ruby',
  'sapphire': 'sapphire',
  'emerald': 'emerald',
  'firered': 'firered',
  'leafgreen': 'leafgreen',
  'diamond': 'diamond',
  'pearl': 'pearl',
  'platinum': 'platinum',
  'heartgold': 'heartgold',
  'soulsilver': 'soulsilver',
  'black': 'black',
  'white': 'white',
  'black-2': 'black-2',
  'white-2': 'white-2',
  'x': 'x',
  'y': 'y',
  'omegaruby': 'omegaruby',
  'alphasapphire': 'alphasapphire',
  'sun': 'sun',
  'moon': 'moon',
  'ultrasun': 'ultrasun',
  'ultramoon': 'ultramoon',
  'lets-go-pikachu': 'letsgopikachu',
  'lets-go-eevee': 'letsgoeevee',
  'sword': 'sword',
  'shield': 'shield',
  'brilliant-diamond': 'brilliantdiamond',
  'shining-pearl': 'shiningpearl',
  'legends-arceus': 'legendsarceus',
  'scarlet': 'scarlet',
  'violet': 'violet'
};

function normalize(name) {
  return name
    .toLowerCase()
    .replace(/♀/g, '-f')
    .replace(/♂/g, '-m')
    .replace(/é/g, 'e')
    .replace(/’/g, '')
    .replace(/'/g, '')
    .replace(/\./g, '')
    .replace(/\s/g, '-')
    .replace(/:/g, '')
    .replace(/[^a-z0-9-]/g, '');
}

async function getMainlineGames(pokemonName) {
  try {
    const url = `https://pokeapi.co/api/v2/pokemon/${pokemonName}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    // Only include games that are in your versionMap
    const games = data.game_indices
      .map(idx => versionMap[idx.version.name])
      .filter(Boolean);
    return Array.from(new Set(games));
  } catch (e) {
    return [];
  }
}

async function main() {
  for (const [name, meta] of Object.entries(metadata)) {
    const pokeapiName = normalize(name);
    const games = await getMainlineGames(pokeapiName);
    if (games.length > 0) {
      meta.games = games.sort();
      console.log(`Set games for ${name}:`, meta.games);
    } else {
      console.log(`No games found for ${name}`);
    }
    // To avoid rate limits, wait a bit between requests
    await new Promise(r => setTimeout(r, 200));
  }
  writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  console.log('Filled games arrays with natural mainline appearances!');
}

main();