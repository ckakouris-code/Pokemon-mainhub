function normalizePokemonName(name) {
  const map = {
    "nidoran♀": "nidoran-f", "nidoranf": "nidoran-f", "nidoran\u2640": "nidoran-f",
    "nidoran♂": "nidoran-m", "nidoranm": "nidoran-m", "nidoran\u2642": "nidoran-m",
    "mr.mime": "mr-mime", "mr mime": "mr-mime",
    "mime jr.": "mime-jr", "mimejr": "mime-jr",
    "type: null": "type-null", "ho-oh": "ho-oh",
    "farfetch’d": "farfetchd", "sirfetch’d": "sirfetchd",
    "porygon-z": "porygon-z", "giratina-origin": "giratina"
  };
  return map[name.toLowerCase().trim()] || name.toLowerCase().trim();
}

document.addEventListener("DOMContentLoaded", () => {
  const bodyClass = document.body.classList;
  const typeMappings = {
    pkfire: "fire", pkwater: "water", pkgrass: "grass", pkbug: "bug", pkrock: "rock",
    pkdark: "dark", pkelectric: "electric", pkfairy: "fairy", pkghost: "ghost", pkground: "ground",
    pkice: "ice", pkflying: "flying", pkfighting: "fighting", pkdragon: "dragon", pknormal: "normal",
    pkpoison: "poison", pksteel: "steel", pkpsychic: "psychic"
  };

  let pageType = null;
  for (const key in typeMappings) {
    if (bodyClass.contains(key)) {
      pageType = typeMappings[key];
      break;
    }
  }

  if (pageType) setupPokemonPage(pageType);

  const homeBtn = document.getElementById("homeBtn");
  if (homeBtn) {
    homeBtn.addEventListener("click", () => {
      window.location.href = "pkmnpg-index.html";
    });
  }
});

function setupPokemonPage(type) {
  const randomBtn = document.getElementById(`random${type}`);
  const resultContainer = document.getElementById(`${type}Result`);
  const officialLink = document.getElementById("officialLink");
  const serebiiLink = document.getElementById("serebiiLink");
  const bulbapediaLink = document.getElementById("bulbapediaLink");

  if (!randomBtn || !resultContainer || !officialLink || !serebiiLink || !bulbapediaLink) {
    console.error("❌ Missing required elements for link or result handling.");
    return;
  }

  let pokemonList = [];

  fetch(`https://pokeapi.co/api/v2/type/${type}`)
    .then(res => res.json())
    .then(data => {
      pokemonList = data.pokemon
        .filter(p => !p.pokemon.name.includes("-"))
        .map(p => p.pokemon.name);
    })
    .catch(error => {
      console.error(`❌ Error loading ${type}-type list:`, error);
      resultContainer.textContent = "Failed to load Pokémon list.";
    });

  randomBtn.addEventListener("click", async () => {
    if (pokemonList.length === 0) {
      resultContainer.textContent = `No ${type}-type Pokémon found.`;
      return;
    }

    resultContainer.innerHTML = "Fetching Pokémon...";

    // Hide links while loading
    [officialLink, serebiiLink, bulbapediaLink].forEach(link => {
      link.classList.remove("show");
      link.classList.add("hidden");
    });

    const randomName = pokemonList[Math.floor(Math.random() * pokemonList.length)];

    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomName}`);
      const pokemon = await res.json();

      if (pokemon.id > 1100 || pokemon.name.includes("-")) {
        resultContainer.textContent = "That Pokémon isn't supported in this Dex. Try again!";
        return;
      }

      const formattedName = normalizePokemonName(pokemon.name);
      const serebiiURL = `https://www.serebii.net/pokemon/${formattedName}/`;
      const bulbapediaURL = `https://bulbapedia.bulbagarden.net/wiki/${pokemon.name
        .toLowerCase()
        .replace(/\s+/g, "_")
        .replace(/'/g, "%27")}_\(Pokémon\)`;
      const officialDexURL = `https://www.pokemon.com/us/pokedex/${pokemon.id}`;

      resultContainer.innerHTML = `
  <h3>${pokemon.name.toUpperCase()}</h3>
  <img src="${pokemon.sprites.front_default}" class="${type}-sprite" alt="${pokemon.name}">
  <p>Type: ${pokemon.types.map(t => t.type.name).join(", ")}</p>
`;

      officialLink.href = officialDexURL;
      serebiiLink.href = serebiiURL;
      bulbapediaLink.href = bulbapediaURL;

      // Now show the links after everything is set
      [officialLink, serebiiLink, bulbapediaLink].forEach(link => {
        link.classList.remove("hidden");
        link.classList.add("show");
      });

    } catch (error) {
      console.error("❌ Failed to fetch Pokémon details:", error);
      resultContainer.textContent = "Failed to fetch Pokémon.";
    }
  });
}