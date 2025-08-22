const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const showdownUrl = 'https://raw.githubusercontent.com/smogon/pokemon-showdown/master/data/pokedex.json';
const paldeaUrl = 'https://raw.githubusercontent.com/sindresorhus/pokemon/main/data/paldea.json';

// List of all mainline games (PokéAPI/Showdown slugs)
const mainlineGames = [
  "red", "blue", "yellow", "green",
  "gold", "silver", "crystal",
  "ruby", "sapphire", "emerald",
  "firered", "leafgreen",
  "diamond", "pearl", "platinum",
  "heartgold", "soulsilver",
  "black", "white", "black2", "white2",
  "x", "y", "omegaruby", "alphasapphire",
  "sun", "moon", "ultrasun", "ultramoon",
  "letsgoeevee", "letsgopikachu",
  "sword", "shield",
  "legendsarceus",
  "scarlet", "violet"
];

// Helper to normalize names to your metadata keys
function normalize(name) {
  return name
    .toLowerCase()
    .replace(/♀/g, '-f')
    .replace(/♂/g, '-m')
    .replace(/é/g, 'e')
    .replace(/[^a-z0-9-]/g, '');
}

async function main() {
  // Download both datasets
  const [showdownRes, paldeaRes] = await Promise.all([
    fetch(showdownUrl),
    fetch(paldeaUrl)
  ]);
  const showdownText = await showdownRes.text();
  const paldeaData = await paldeaRes.json();

  // Parse showdown pokedex.json (JS, not JSON)
  const objStart = showdownText.indexOf('{');
  const objEnd = showdownText.lastIndexOf('}');
  const showdownData = JSON.parse(showdownText.slice(objStart, objEnd + 1));

  // Build a mapping: {pokemon: [games...]}
  const gamesMap = {};

  // Scarlet/Violet (from Sindre Sorhus)
  for (const entry of paldeaData) {
    const key = normalize(entry.name);
    if (!gamesMap[key]) gamesMap[key] = [];
    gamesMap[key].push('scarlet', 'violet');
  }

  // For all other games, use Showdown's pokedex.json
  for (const [key, poke] of Object.entries(showdownData)) {
    // Only include Pokémon that are not "Cosmetic Formes" (isNonstandard: "Past" or "Unobtainable" means not in mainline games)
    if (poke.isNonstandard && poke.isNonstandard !== "Legal") continue;

    // Normalize name
    const metaKey = normalize(poke.name);

    // For each mainline game, check if the Pokémon is available
    if (!gamesMap[metaKey]) gamesMap[metaKey] = [];

    // Showdown's "availability" is not explicit per game, so we use gen numbers and forms
    // We'll use gen numbers to infer which games the Pokémon is in
    // You can expand this logic for more accuracy if you have a better source

    // Gen 1
    if (poke.gen === 1) gamesMap[metaKey].push("red", "blue", "yellow", "green");
    // Gen 2
    if (poke.gen === 2) gamesMap[metaKey].push("gold", "silver", "crystal");
    // Gen 3
    if (poke.gen === 3) gamesMap[metaKey].push("ruby", "sapphire", "emerald", "firered", "leafgreen");
    // Gen 4
    if (poke.gen === 4) gamesMap[metaKey].push("diamond", "pearl", "platinum", "heartgold", "soulsilver");
    // Gen 5
    if (poke.gen === 5) gamesMap[metaKey].push("black", "white", "black2", "white2");
    // Gen 6
    if (poke.gen === 6) gamesMap[metaKey].push("x", "y", "omegaruby", "alphasapphire");
    // Gen 7
    if (poke.gen === 7) gamesMap[metaKey].push("sun", "moon", "ultrasun", "ultramoon", "letsgoeevee", "letsgopikachu");
    // Gen 8
    if (poke.gen === 8) gamesMap[metaKey].push("sword", "shield", "legendsarceus");
    // Gen 9 (handled above with Paldea)

    // Remove duplicates and sort
    gamesMap[metaKey] = Array.from(new Set(gamesMap[metaKey])).sort();
  }

  fs.writeFileSync('metadata-games.json', JSON.stringify(gamesMap, null, 2));
  console.log('metadata-games.json created!');
}

main();

// Update these paths as needed:
const metadataPath = path.join(__dirname, 'metadata-all.json'); // or metadata-kanto.json, etc.
const gamesPath = path.join(__dirname, 'metadata-games.json');

const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
const gamesMap = JSON.parse(fs.readFileSync(gamesPath, 'utf8'));

let changed = false;
for (const [name, meta] of Object.entries(metadata)) {
  if (gamesMap[name]) {
    // Only update if different or missing
    if (
      !meta.games ||
      meta.games.length !== gamesMap[name].length ||
      !meta.games.every(g => gamesMap[name].includes(g))
    ) {
      meta.games = [...gamesMap[name]];
      changed = true;
      console.log(`Updated games for ${name}:`, meta.games);
    }
  } else {
    // Optionally, remove games if not present in gamesMap
    if (meta.games) {
      delete meta.games;
      changed = true;
      console.log(`Removed games for ${name} (not in gamesMap)`);
    }
  }
}

if (changed) {
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  console.log(`Patched ${path.basename(metadataPath)} with up-to-date games arrays!`);
} else {
  console.log('No changes made.');
}