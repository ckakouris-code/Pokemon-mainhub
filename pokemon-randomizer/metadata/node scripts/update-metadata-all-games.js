const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const metadataPath = path.join(__dirname, 'metadata-all.json');
const mainlineGames = [
  "red", "blue", "yellow", "green",
  "gold", "silver", "crystal",
  "ruby", "sapphire", "emerald",
  "firered", "leafgreen",
  "diamond", "pearl", "platinum",
  "heartgold", "soulsilver",
  "black", "white", "black-2", "white-2",
  "x", "y", "omega-ruby", "alpha-sapphire",
  "sun", "moon", "ultra-sun", "ultra-moon",
  "lets-go-pikachu", "lets-go-eevee",
  "sword", "shield",
  "brilliant-diamond", "shining-pearl",
  "legends-arceus",
  "scarlet", "violet"
];

// Map PokéAPI version names to your game names
const versionMap = {
  "red": "red", "blue": "blue", "yellow": "yellow", "green": "green",
  "gold": "gold", "silver": "silver", "crystal": "crystal",
  "ruby": "ruby", "sapphire": "sapphire", "emerald": "emerald",
  "firered": "firered", "leafgreen": "leafgreen",
  "diamond": "diamond", "pearl": "pearl", "platinum": "platinum",
  "heartgold": "heartgold", "soulsilver": "soulsilver",
  "black": "black", "white": "white", "black-2": "black-2", "white-2": "white-2",
  "x": "x", "y": "y", "omega-ruby": "omega-ruby", "alpha-sapphire": "alpha-sapphire",
  "sun": "sun", "moon": "moon", "ultra-sun": "ultra-sun", "ultra-moon": "ultra-moon",
  "lets-go-pikachu": "lets-go-pikachu", "lets-go-eevee": "lets-go-eevee",
  "sword": "sword", "shield": "shield",
  "brilliant-diamond": "brilliant-diamond", "shining-pearl": "shining-pearl",
  "legends-arceus": "legends-arceus",
  "scarlet": "scarlet", "violet": "violet"
};

function normalizeName(name) {
  return name
    .toLowerCase()
    .replace(/[\s.'’:-]/g, '')
    .replace(/♀/g, 'f')
    .replace(/♂/g, 'm')
    .replace(/é/g, 'e');
}

async function main() {
  const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  const entries = Object.entries(metadata);
  let changed = false;

  for (const [poke, meta] of entries) {
    const pokeName = normalizeName(poke);
    // Use PokéAPI's species endpoint for National Dex number
    let apiName = pokeName;
    // Handle some special cases for PokéAPI names
    if (apiName === "nidoranf") apiName = "nidoran-f";
    if (apiName === "nidoranm") apiName = "nidoran-m";
    if (apiName === "farfetchd") apiName = "farfetchd";
    if (apiName === "mr.mime") apiName = "mr-mime";
    if (apiName === "mimejr") apiName = "mime-jr";
    if (apiName === "type:null") apiName = "type-null";
    if (apiName === "flabebe") apiName = "flabebe";
    // Add more as needed

    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${apiName}`);
      if (!res.ok) {
        console.warn(`Could not fetch ${poke} (${apiName})`);
        continue;
      }
      const pokeData = await res.json();
      // Get all mainline games this Pokémon appears in
      const games = new Set();
      for (const gi of pokeData.game_indices) {
        const mapped = versionMap[gi.version.name];
        if (mainlineGames.includes(mapped)) games.add(mapped);
      }
      // Add Scarlet/Violet if in the latest gen
      if (pokeData.game_indices.some(gi => gi.version.name === "scarlet" || gi.version.name === "violet")) {
        games.add("scarlet");
        games.add("violet");
      }
      // Update metadata
      const gamesArr = Array.from(games);
      if (
        !meta.games ||
        meta.games.length !== gamesArr.length ||
        !meta.games.every(g => gamesArr.includes(g))
      ) {
        meta.games = gamesArr;
        changed = true;
        console.log(`Updated games for ${poke}:`, gamesArr);
      }
      // Also update id if needed
      if (pokeData.id && meta.id !== pokeData.id) {
        meta.id = pokeData.id;
        changed = true;
        console.log(`Updated id for ${poke}:`, pokeData.id);
      }
    } catch (e) {
      console.warn(`Error fetching ${poke}:`, e.message);
    }
    // To avoid rate limits, wait a bit
    await new Promise(r => setTimeout(r, 100));
  }

  if (changed) {
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
    console.log('metadata-all.json updated!');
  } else {
    console.log('No changes made.');
  }
}

main();