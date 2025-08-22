// Name fixes for special Pokémon names
const nameFixes = {
  "nidoran-f": "nidoran-f",
  "nidoran-m": "nidoran-m",
  "mr-mime": "mr-mime",
  "mime-jr": "mime-jr",
  "farfetchd": "farfetchd",
  "sirfetchd": "sirfetchd",
  "type-null": "type-null",
  "jangmo-o": "jangmo-o",
  "hakamo-o": "hakamo-o",
  "kommo-o": "kommo-o",
  "tapu-koko": "tapu-koko",
  "tapu-lele": "tapu-lele",
  "tapu-bulu": "tapu-bulu",
  "tapu-fini": "tapu-fini",
  "mr-rime": "mr-rime",
  "flabebe": "flabebe"
  // Add more as needed
};

// Fetch local metadata for the selected region (e.g. kanto.json)
async function fetchMetadata(regionName) {
  if (regionName === "all") {
    const allRegions = [
      "kanto", "johto", "hoenn", "sinnoh",
      "unova", "kalos", "alola", "galar", "hisui", "paldea"
    ];

    const files = await Promise.all(
      allRegions.map(region =>
        fetch(`metadata/metadata-${region}.json`)
          .then(res => res.json())
          .catch(err => {
            console.error(`❌ Failed to load ${region}:`, err);
            return {};
          })
      )
    );

    return Object.assign({}, ...files);
  }

  const res = await fetch(`metadata/metadata-${regionName}.json`);
  return res.json();
}

// PokéAPI sprite URL builder (official-artwork)
function getPokeApiSprite(idOrName) {
  // If it's a number, use official artwork by ID
  if (typeof idOrName === "number") {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${idOrName}.png`;
  }

  // Use the form name for regional forms
  const apiName = nameFixes[idOrName.toLowerCase()] || idOrName.toLowerCase();
  const normalized = apiName
    .replace(/[\s.'’]/g, '-') // spaces, dots, apostrophes to hyphens
    .replace(/:/g, '')        // remove colons
    .replace(/♀/g, '-f')
    .replace(/♂/g, '-m')
    .replace(/-+/g, '-');     // collapse multiple hyphens

  // If the name includes a regional form, always use the name (not the ID)
  if (
    normalized.includes('-hisui') ||
    normalized.includes('-galar') ||
    normalized.includes('-alola') ||
    normalized.includes('-paldea')
  ) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${normalized}.png`;
  }

  // Otherwise, use the ID if available, else the normalized name
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${normalized}.png`;
}

// PokéAPI default sprite fallback
function getPokeApiDefaultSprite(name) {
  const apiName = nameFixes[name.toLowerCase()] || name.toLowerCase();
  const normalized = apiName
    .replace(/[\s.'’]/g, '-')
    .replace(/:/g, '')
    .replace(/♀/g, '-f')
    .replace(/♂/g, '-m')
    .replace(/-+/g, '-');
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${normalized}.png`;
}

// The 151 Sinnoh Dex Pokémon for BDSP (Serebii slugs, all lowercase, no Carnivine)
const sinnohDex151 = [
  "abomasnow", "alakazam", "arcanine", "articuno", "bastiodon", "bibarel",
  "bidoof", "bronzong", "carnivine", "chatot", "cherubi", "cherrim",
  "cynthia", "darkrai", "dialga", "dusknoir", "electivire", "empoleon",
  "finneon", "floatzel", "garchomp", "gardevoir", "gastrodon", "gliscor",
  "golem", "honchkrow", "infernape", "kricketune", "luxray", "magmortar",
  "mamoswine", "manaphy", "mismagius", "pachirisu", "palkia", "porygon-z",
  "rapidash", "regigigas", "roserade", "scizor", "sharpeedo", "spiritomb",
  "staraptor", "tangrowth", "torterra", "toxicroak", "weavile", "yanmega"
];

// For fast lookup:
const sinnohDexNames = new Set(sinnohDex151);

// Load Sinnoh Dex names at startup (assuming you fetch or import metadata-sinnoh.json)
let sinnohDexNamesOld = new Set();
fetch('metadata/metadata-sinnoh.json')
  .then(res => res.json())
  .then(data => {
    sinnohDexNamesOld = new Set(Object.keys(data));
  });

// Serebii Pokédex URL builder (handles all conventions, with BDSP/Sinnoh Dex fix)
function getSerebiiUrl(name, meta = {}, regionOrGen = null) {
  const serebiiFixes = {
    // Kanto/Johto/Hoenn/Sinnoh
    "mr-mime": "mrmime",
    "mime-jr": "mimejr",
    "mr-rime": "mrrime",
    "type-null": "typenull",
    "ho-oh": "hooh",
    "porygon-z": "porygonz",
    "flabebe": "flabebe",
    "jangmo-o": "jangmoo",
    "hakamo-o": "hakamoo",
    "kommo-o": "kommoo",
    "tapu-koko": "tapukoko",
    "tapu-lele": "tapulele",
    "tapu-bulu": "tapubulu",
    "tapu-fini": "tapufini",
    "farfetchd": "farfetchd",
    "sirfetchd": "sirfetchd",
    "nidoran-f": "nidoranf",
    "nidoran-m": "nidoranm",
    "type-null": "typenull",
    // Galarian/Alolan/Hisui/Paldea forms
    "meowth-galar": "meowthgalar",
    "meowth-alola": "meowthalola",
    "ponyta-galar": "ponytagalar",
    "rapidash-galar": "rapidashgalar",
    "slowpoke-galar": "slowpokegalar",
    "slowbro-galar": "slowbrogalar",
    "slowking-galar": "slowkinggalar",
    "articuno-galar": "articunogalar",
    "zapdos-galar": "zapdosgalar",
    "moltres-galar": "moltresgalar",
    "corsola-galar": "corsolagalar",
    "zigzagoon-galar": "zigzagoongalar",
    "linoone-galar": "linoonegalar",
    "darumaka-galar": "darumakagalar",
    "darmanitan-galar": "darmanitangalar",
    "yamask-galar": "yamaskgalar",
    "stunfisk-galar": "stunfiskgalar",
    "weezing-galar": "weezinggalar",
    "mr-mime-galar": "mrmimegalar",
    "growlithe-hisui": "growlithehisui",
    "arcanine-hisui": "arcaninehisui",
    "voltorb-hisui": "voltorbhisui",
    "electrode-hisui": "electrodehisui",
    "typhlosion-hisui": "typhlosionhisui",
    "qwilfish-hisui": "qwilfishhisui",
    "sneasel-hisui": "sneaselhisui",
    "samurott-hisui": "samurotthisui",
    "lilligant-hisui": "lilliganthisui",
    "zorua-hisui": "zoruahisui",
    "zoroark-hisui": "zoroarkhisui",
    "braviary-hisui": "braviaryhisui",
    "sliggoo-hisui": "sliggoohisui",
    "goodra-hisui": "goodrahisui",
    "avalugg-hisui": "avalugghisui",
    "decidueye-hisui": "decidueyehisui",
    "tauros-paldea": "taurospaldea",
    "wooper-paldea": "wooperpaldea",
    // Others
    "oricorio-baile": "orocoriobaile",
    "oricorio-pom-pom": "orocoriopompom",
    "oricorio-pau": "orocoriopau",
    "oricorio-sensu": "orocoriosensu",
    "lycanroc-midday": "lycanrocmidday",
    "lycanroc-midnight": "lycanrocmidnight",
    "lycanroc-dusk": "lycanrocdusk",
    "minior-red-meteor": "miniormeteor",
    "wishiwashi-solo": "wishiwashisolo",
    "wishiwashi-school": "wishiwashischool",
    "toxtricity-amped": "toxtricityamped",
    "toxtricity-low-key": "toxtricitylowkey",
    "indeedee-male": "indeedeemale",
    "indeedee-female": "indeedeefemale",
    "morpeko-full-belly": "morpekofullbelly",
    "morpeko-hangry": "morpekohangry",
    "urshifu-single-strike": "urshifusinglestrike",
    "urshifu-rapid-strike": "urshifurapidstrike",
    "basculegion-male": "basculegionmale",
    "basculegion-female": "basculegionfemale",
    "maushold-family-of-three": "mausholdfamilyofthree",
    "maushold-family-of-four": "mausholdfamilyoffour",
    "dudunsparce-two-segment": "dudunsparcetwosegment",
    "dudunsparce-three-segment": "dudunsparcethreesegment",
    "paldean-tauros-combat-breed": "taurospaldeacombat",
    "paldean-tauros-blaze-breed": "taurospaldeablaze",
    "paldean-tauros-aqua-breed": "taurospaldeaaqua"
    // Add more as needed!
  };

  let raw = nameFixes[name.toLowerCase()] || name.toLowerCase();
  let urlName = serebiiFixes[raw] || raw;
  urlName = urlName
    .replace(/[\s.'’:-]/g, '')
    .replace(/♀/g, 'f')
    .replace(/♂/g, 'm');

  const num = meta.id ? meta.id.toString().padStart(3, '0') : urlName;

  // Use the dex set for the current game/region if available
  const dexSetKey = getDexSetKey(regionOrGen);
  const dexSet = dexSetKey ? dexSets[dexSetKey] : null;

  if (
    regionOrGen &&
    (
      regionOrGen === "red" ||
      regionOrGen === "blue" ||
      regionOrGen === "yellow" ||
      regionOrGen === "green"
    )
  ) {
    // Use the National Dex number, padded to 3 digits
    const num = meta.id ? meta.id.toString().padStart(3, '0') : urlName;
    return `https://www.serebii.net/pokedex/${num}.shtml`;
  }

  if (
    regionOrGen &&
    (regionOrGen === "brilliantdiamond" || regionOrGen === "shiningpearl")
  ) {
    // Always use SwSh convention for BDSP Pokémon
    return `https://www.serebii.net/pokedex-swsh/${urlName}/`;
  }

  // Dex conventions: newest to oldest
  const dexUrlOrder = [
    { games: ["scarlet", "violet"], dex: "pokedex-sv", type: "name" },
    { games: ["sword", "shield"], dex: "pokedex-swsh", type: "name" },
    { games: ["brilliantdiamond", "shiningpearl"], dex: "pokedex-bdsp", type: "name" },
    { games: ["lets-go-pikachu", "lets-go-eevee"], dex: "pokedex-lgpe", type: "name" },
    { games: ["ultra-sun", "ultra-moon", "sun", "moon"], dex: "pokedex-sm", type: "number" },
    { games: ["x", "y"], dex: "pokedex-xy", type: "number" },
    { games: ["black", "white", "black-2", "white-2"], dex: "pokedex-bw", type: "number" },
    { games: ["diamond", "pearl", "platinum"], dex: "pokedex-dp", type: "number" },
    { games: ["gold", "silver", "crystal"], dex: "pokedex-gs", type: "number" },
    { games: ["ruby", "sapphire", "emerald"], dex: "pokedex-rs", type: "number" },
    { games: ["firered", "leafgreen"], dex: "pokedex-rs", type: "number" },
    { games: ["red", "blue", "yellow", "green"], dex: "pokedex-rb", type: "number" }
  ];

  // Helper: find the best dex for this Pokémon
  function findBestDex(meta, regionOrGen) {
    if (regionOrGen && regionOrGen !== "all") {
      for (const d of dexUrlOrder) {
        if (d.games.some(g => g.replace(/[\s_]/g, '').toLowerCase() === regionOrGen.replace(/[\s_]/g, '').toLowerCase())) {
          if (
            !name.endsWith('-hisui') &&
            !name.endsWith('-galar') &&
            !name.endsWith('-alola') &&
            !name.endsWith('-paldea')
          ) {
            return d;
          }
        }
      }
    }
    if (meta.games) {
      for (const d of dexUrlOrder) {
        if (d.games.some(g => meta.games.includes(g))) {
          if (
            !name.endsWith('-hisui') &&
            !name.endsWith('-galar') &&
            !name.endsWith('-alola') &&
            !name.endsWith('-paldea')
          ) {
            return d;
          }
        }
      }
    }
    return null;
  }

  const bestDex = findBestDex(meta, regionOrGen);

  if (bestDex) {
    if (bestDex.type === "name") {
      return `https://www.serebii.net/${bestDex.dex}/${urlName}/`;
    } else {
      return `https://www.serebii.net/${bestDex.dex}/${num}.shtml`;
    }
  }

  return `https://www.serebii.net/pokedex/${num}.shtml`;
}

// Serebii artwork fallback
function getSerebiiSprite(name) {
  let num = '000';
  let baseName = name;
  let form = '';

  if (name.endsWith('-hisui')) {
    baseName = name.replace('-hisui', '');
    form = '-hisui';
  } else if (name.endsWith('-galar')) {
    baseName = name.replace('-galar', '');
    form = '-galarian';
  } else if (name.endsWith('-alola')) {
    baseName = name.replace('-alola', '');
    form = '-alolan';
  } else if (name.endsWith('-paldea')) {
    baseName = name.replace('-paldea', '');
    form = '-paldean';
  }

  // Use last loaded metadata to get the National Dex number
  if (window.lastMetadata && window.lastMetadata[baseName] && window.lastMetadata[baseName].id) {
    num = window.lastMetadata[baseName].id.toString().padStart(3, '0');
  }

  return `https://www.serebii.net/pokemon/art/${num}${form}.png`;
}

async function generateTeam({ mode, region, type, game }) {
  console.log("🚀 Generate button clicked!");
  const regionMap = {
    "11": "all",
    "1": "kanto",
    "2": "johto",
    "3": "hoenn",
    "4": "sinnoh",
    "5": "unova",
    "6": "kalos",
    "7": "alola",
    "8": "galar",
    "9": "hisui",
    "10": "paldea",
  };

  const regionName = regionMap[region];
  if (!regionName) {
    console.warn("Unsupported region for team generation");
    return;
  }

  const metadata = await fetchMetadata(regionName);
  window.lastMetadata = metadata; // For Serebii fallback
  const speciesNames = Object.keys(metadata);

  const pool = speciesNames.map(name => {
    const meta = metadata[name] || {};

    // Display name prettifier for regional forms
    let displayName = name;
    if (name.endsWith('-hisui')) {
      displayName = 'Hisuian ' + name.replace('-hisui', '').replace(/^\w/, c => c.toUpperCase());
    } else if (name.endsWith('-galar')) {
      displayName = 'Galarian ' + name.replace('-galar', '').replace(/^\w/, c => c.toUpperCase());
    } else if (name.endsWith('-alola')) {
      displayName = 'Alolan ' + name.replace('-alola', '').replace(/^\w/, c => c.toUpperCase());
    } else if (name.endsWith('-paldea')) {
      displayName = 'Paldean ' + name.replace('-paldea', '').replace(/^\w/, c => c.toUpperCase());
    } else {
      displayName = name.charAt(0).toUpperCase() + name.slice(1);
    }

    return {
      name: displayName,
      slug: name,
      types: (meta.types || []).map(t => t.toLowerCase().trim()),
      // Use the name for regional forms, otherwise use ID if available
      sprite: (
        name.includes('-hisui') ||
        name.includes('-galar') ||
        name.includes('-alola') ||
        name.includes('-paldea')
      )
        ? getPokeApiSprite(name)
        : (meta.id ? getPokeApiSprite(meta.id) : getPokeApiSprite(name)),
      ...meta
    };
  }).filter(p => {
    // Always exclude legendaries
    if (p.isLegendary) return false;

    // Only include final evolutions unless "challenge - base forms" is checked
    const baseFormsChecked = mode === "challenge" && document.getElementById("base-forms").checked;
    if (!baseFormsChecked && !p.isFinalForm) return false;

    if (game !== "any" && (!p.games || !p.games.includes(game))) return false;
    // --- Fix type filter: always compare lowercased and trimmed ---
    if (type !== "any" && !p.types.includes(type.toLowerCase().trim())) return false;

    // Challenge mode filters
    if (mode === "challenge") {
      if (document.getElementById("early-access").checked && !p.availableEarly) return false;
      if (document.getElementById("mono-type").checked && (!p.types || p.types.length !== 1)) return false;
    }

    // Exclude event-only or unobtainable Pokémon
    if (p.isEventOnly || p.isTransferOnly || p.isUnobtainable) return false;

    return true;
  });

  console.log(`🎯 Filtered pool size: ${pool.length}`);
  if (pool.length === 0) {
    renderTeam([]);
    return;
  }

  const teamSize = (mode === "single" || mode === "one" || mode === "solo") ? 1 : 6;
  const selected = [];
  const usedIndices = new Set();

  if (pool.length <= teamSize) {
    renderTeam(pool);
    return;
  }

  while (selected.length < teamSize) {
    const index = Math.floor(Math.random() * pool.length);
    if (usedIndices.has(index)) continue;
    usedIndices.add(index);
    selected.push(pool[index]);
  }

  renderTeam(selected);
}

async function generateOnePokemon({ region, type, game, mode }) {
  const regionMap = {
    "1": "kanto",
    "2": "johto",
    "3": "hoenn",
    "4": "sinnoh",
    "5": "unova",
    "6": "kalos",
    "7": "alola",
    "8": "galar",
    "9": "hisui",
    "10": "paldea",
    "11": "all"
  };

  const regionName = regionMap[region];
  if (!regionName) {
    console.warn("Unsupported region for single Pokémon roll");
    return;
  }

  const metadata = await fetchMetadata(regionName);
  window.lastMetadata = metadata; // For Serebii fallback
  const speciesNames = Object.keys(metadata);

  const pool = speciesNames.map(name => {
    const meta = metadata[name] || {};

    // Display name prettifier for regional forms
    let displayName = name;
    if (name.endsWith('-hisui')) {
      displayName = 'Hisuian ' + name.replace('-hisui', '').replace(/^\w/, c => c.toUpperCase());
    } else if (name.endsWith('-galar')) {
      displayName = 'Galarian ' + name.replace('-galar', '').replace(/^\w/, c => c.toUpperCase());
    } else if (name.endsWith('-alola')) {
      displayName = 'Alolan ' + name.replace('-alola', '').replace(/^\w/, c => c.toUpperCase());
    } else if (name.endsWith('-paldea')) {
      displayName = 'Paldean ' + name.replace('-paldea', '').replace(/^\w/, c => c.toUpperCase());
    } else {
      displayName = name.charAt(0).toUpperCase() + name.slice(1);
    }

    return {
      name: displayName,
      slug: name,
      types: (meta.types || []).map(t => t.toLowerCase().trim()),
      // Use the name for regional forms, otherwise use ID if available
      sprite: (
        name.includes('-hisui') ||
        name.includes('-galar') ||
        name.includes('-alola') ||
        name.includes('-paldea')
      )
        ? getPokeApiSprite(name)
        : (meta.id ? getPokeApiSprite(meta.id) : getPokeApiSprite(name)),
      ...meta
    };
  }).filter(p => {
    // Always exclude legendaries
    if (p.isLegendary) return false;

    const baseFormsChecked = mode === "challenge" && document.getElementById("base-forms").checked;
    if (!baseFormsChecked && !p.isFinalForm) return false;

    if (game !== "any" && (!p.games || !p.games.includes(game))) return false;
    // --- Fix type filter: always compare lowercased and trimmed ---
    if (type !== "any" && !p.types.includes(type.toLowerCase().trim())) return false;

    if (mode === "challenge") {
      if (document.getElementById("early-access").checked && !p.availableEarly) return false;
      if (document.getElementById("mono-type").checked && (!p.types || p.types.length !== 1)) return false;
    }

    // Exclude event-only or unobtainable Pokémon
    if (p.isEventOnly || p.isTransferOnly || p.isUnobtainable) return false;

    return true;
  });

  console.log(`🎯 Filtered pool size: ${pool.length}`);
  if (pool.length === 0) {
    renderTeam([]);
    return;
  }

  const singlePick = pool[Math.floor(Math.random() * pool.length)];
  renderTeam([singlePick]);
}

// --- renderTeam function ---
function renderTeam(team) {
  const display = document.getElementById("team-display");
  display.innerHTML = '';
  const game = document.getElementById("game").value;
  const dex = getDexForGame(game);

  team.forEach(pokemon => {
    const card = document.createElement('div');
    card.classList.add('pokemon-card');
    card.innerHTML = `
      <h3>${pokemon.name}</h3>
      <p><strong>Type:</strong> ${pokemon.types.join(", ")}</p>
      <a href="${getSerebiiUrl(pokemon.slug, pokemon, dex)}" target="_blank" rel="noopener">Serebii Pokédex</a>
      <button class="pin-btn">📌 Pin to Team</button>
    `;

    // Robust image fallback logic (official-artwork → default sprite → Serebii → missing.png)
    const img = document.createElement('img');
    img.src = pokemon.sprite;
    img.alt = pokemon.name;
    img.width = 96;
    img.height = 96;
    img.style.objectFit = "contain";
    let triedDefault = false;
    let triedSerebii = false;
    img.onerror = function handleError() {
      if (!triedDefault) {
        triedDefault = true;
        img.src = getPokeApiDefaultSprite(pokemon.slug);
      } else if (!triedSerebii) {
        triedSerebii = true;
        img.src = getSerebiiSprite(pokemon.slug);
      } else {
        img.onerror = null;
        img.src = 'images/missing.png';
      }
    };
    card.insertBefore(img, card.querySelector('p'));

    card.querySelector(".pin-btn").addEventListener("click", () => {
      pinPokemon(pokemon, dex);
    });
    display.appendChild(card);
  });

  if (team.length === 1) {
    display.classList.add('single');
  } else {
    display.classList.remove('single');
  }
}

function pinPokemon(pokemon, regionOrGen = null) {
  const pinned = document.getElementById("pinned-container");

  // Enforce team size limit of 6
  if (pinned.children.length >= 6) {
    alert("The rules of the pokemon league challenge only allow the use of 6 pokemon, please remove one of your members in order to add another");
    return;
  }

  // Prevent duplicate pins
  const alreadyPinned = Array.from(pinned.children).some(div =>
    div.querySelector("h3")?.textContent === pokemon.name
  );
  if (alreadyPinned) return;

  const card = document.createElement('div');
  card.classList.add('pokemon-card', 'pinned');
  card.innerHTML = `
    <h3>${pokemon.name}</h3>
    <p><strong>Type:</strong> ${pokemon.types.join(", ")}</p>
    <a href="${getSerebiiUrl(pokemon.slug, pokemon, regionOrGen)}" target="_blank" rel="noopener">Serebii Pokédex</a>
    <button class="remove-pin" title="Remove from pinned team">❌ Remove</button>
  `;

  // Robust image fallback logic for pinned
  const img = document.createElement('img');
  img.src = pokemon.sprite;
  img.alt = pokemon.name;
  img.width = 64;
  img.height = 64;
  img.style.objectFit = "contain";
  let triedDefault = false;
  let triedSerebii = false;
  img.onerror = function handleError() {
    if (!triedDefault) {
      triedDefault = true;
      img.src = getPokeApiDefaultSprite(pokemon.slug);
    } else if (!triedSerebii) {
      triedSerebii = true;
      img.src = getSerebiiSprite(pokemon.slug);
    } else {
      img.onerror = null;
      img.src = 'images/missing.png';
    }
  };
  card.insertBefore(img, card.querySelector('p'));

  card.querySelector(".remove-pin").addEventListener("click", () => {
    card.remove();
    updatePinnedBox();
  });

  pinned.appendChild(card);
  updatePinnedBox();
}

const pinnedSection = document.getElementById('pinned-section');
const pinnedContainer = document.getElementById('pinned-container');

function updatePinnedBox() {
  // Show if there is at least one pinned Pokémon
  if (pinnedContainer.children.length > 0) {
    pinnedSection.classList.add('active');
  } else {
    pinnedSection.classList.remove('active');
  }
}

// UI Event Listeners
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("generate-btn").addEventListener("click", () => {
    const mode = document.getElementById("mode").value;
    const region = document.getElementById("region").value;
    const type = document.getElementById("type-filter").value;
    const game = document.getElementById("game").value;
    generateTeam({ mode, region, type, game });
  });

  document.getElementById("generate-single-btn").addEventListener("click", () => {
    const mode = document.getElementById("mode").value;
    const region = document.getElementById("region").value;
    const type = document.getElementById("type-filter").value;
    const game = document.getElementById("game").value;
    generateOnePokemon({ mode, region, type, game });
  });

  document.getElementById("clear-pinned").addEventListener("click", () => {
    document.getElementById("pinned-container").innerHTML = "";
    updatePinnedBox(); // Update pinned box visibility
  });

  document.getElementById("mode").addEventListener("change", (e) => {
    const challengeOptions = document.getElementById("challenge-options");
    const challengeCheckboxes = challengeOptions.querySelectorAll("input[type='checkbox']");
    if (e.target.value === "challenge") {
      challengeOptions.style.display = "block";
      challengeCheckboxes.forEach(cb => {
        cb.disabled = false;
      });
    } else {
      challengeOptions.style.display = "none";
      challengeCheckboxes.forEach(cb => {
        cb.checked = false;
        cb.disabled = true;
      });
    }
  });

  // On page load, disable challenge checkboxes if not in challenge mode
  const challengeOptions = document.getElementById("challenge-options");
  const checkboxes = challengeOptions.querySelectorAll('input[type="checkbox"]');
  if (document.getElementById("mode").value !== "challenge") {
    checkboxes.forEach(cb => {
      cb.checked = false;
      cb.disabled = true;
    });
  }

  // Hide pinned box on load if empty
  updatePinnedBox();

  // Feedback form logic (email version)
  const feedbackForm = document.getElementById("feedback-form");
  if (feedbackForm) {
    feedbackForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const pokemon = document.getElementById("pokemon-name").value.trim();
      const game = document.getElementById("game-name").value.trim();
      const desc = document.getElementById("issue-desc").value.trim();

      // Compose email
      const subject = encodeURIComponent("Pokédex Issue Report");
      const body = encodeURIComponent(
        `Pokémon Name: ${pokemon}\nGame Version: ${game}\n\nIssue Description:\n${desc}`
      );
      // Change this to your email address:
      const mailto = `mailto:codykakouris@gmail.com?subject=${subject}&body=${body}`;

      window.location.href = mailto;

      // Show thank you message
      document.getElementById("feedback-success").style.display = "block";
      feedbackForm.reset();
      setTimeout(() => {
        document.getElementById("feedback-success").style.display = "none";
      }, 3000);
    });
  }
});

function getDexForGame(game) {
  const map = {
    "scarlet": "scarlet",
    "violet": "violet",
    "sword": "sword",
    "shield": "shield",
    "brilliantdiamond": "brilliantdiamond",
    "shiningpearl": "shiningpearl",
    "lets-go-pikachu": "lets-go-pikachu",
    "lets-go-eevee": "lets-go-eevee",
    "sun": "sun",
    "moon": "moon",
    "ultra-sun": "ultra-sun",
    "ultra-moon": "ultra-moon",
    "x": "x",
    "y": "y",
    "black": "black",
    "white": "white",
    "black-2": "black-2",
    "white-2": "white-2",
    "diamond": "diamond",
    "pearl": "pearl",
    "platinum": "platinum",
    "ruby": "ruby",
    "sapphire": "sapphire",
    "emerald": "emerald",
    "firered": "firered",
    "leafgreen": "leafgreen",
    "red": "red",
    "blue": "blue",
    "yellow": "yellow",
    "gold": "gold",
    "silver": "silver",
    "crystal": "crystal"
  };
  return map[game.replace(/[\s_]/g, '').toLowerCase()] || null;
}

// --- Load dex lists at startup
let dexLists = {};
let dexSets = {}; // For fast lookup by region key

fetch('metadata/dexlists.json')
  .then(res => res.json())
  .then(data => {
    dexLists = data;
    // Build sets for fast lookup
    for (const key in dexLists) {
      dexSets[key] = new Set(dexLists[key]);
    }
  });

// Helper to get the correct dex set key for a game/region
function getDexSetKey(regionOrGen) {
  switch (regionOrGen) {
    case "brilliantdiamond":
    case "shiningpearl":
      return "bdsp_sinnoh_151";
    case "sword":
    case "shield":
      return "galar_400";
    // Add more cases as you add more lists
    default:
      return null;
  }
}