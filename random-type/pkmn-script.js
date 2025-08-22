document.addEventListener("DOMContentLoaded", async function () {
  console.log("✅ Main script loaded.");

  function normalizePokemonName(name) {
    const map = {
      "nidoran♀": "nidoran-f", "nidoranf": "nidoran-f", "nidoran\u2640": "nidoran-f",
      "nidoran♂": "nidoran-m", "nidoranm": "nidoran-m", "nidoran\u2642": "nidoran-m",
      "mr.mime": "mr-mime", "mr mime": "mr-mime",
      "mime jr.": "mime-jr", "mimejr": "mime-jr",
      "type: null": "type-null", "ho-oh": "ho-oh",
      "farfetch’d": "farfetchd", "sirfetch’d": "sirfetchd",
      "porygon-z": "porygon-z", "jangmo-o": "jangmo-o",
      "hakamo-o": "hakamo-o", "kommo-o": "kommo-o",
      "deoxys-attack": "deoxys", "giratina-origin": "giratina"
    };
    return map[name.toLowerCase().trim()] || name.toLowerCase().trim();
  }

 /* const isHomepage = document.body.classList.length === 0;
  if (!isHomepage) return;*/

  const isHomepage = document.body.classList.contains("homepage");
if (!isHomepage) return;

  const randomBtn = document.getElementById("randomButton");
  const typeDropdown = document.getElementById("type");
  const searchBtn = document.getElementById("searchButton");
  const searchInput = document.getElementById("searchInput");
  const searchResult = document.getElementById("searchResult");
  const randomTypeBtn = document.getElementById("randomTypeBtn");

  function displayPokemon(pokemon) {
    const formattedName = normalizePokemonName(pokemon.name);
    const serebiiURL = `https://www.serebii.net/pokemon/${formattedName}/`;
    const bulbapediaURL = `https://bulbapedia.bulbagarden.net/wiki/${pokemon.name
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/'/g, "%27")}_\(Pokémon\)`;
    const officialDexURL = `https://www.pokemon.com/us/pokedex/${pokemon.id}`;

    searchResult.innerHTML = `
      <h3>${pokemon.name.toUpperCase()}</h3>
      <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
      <p>Type: ${pokemon.types.map(t => t.type.name).join(", ")}</p>
      <div class="link-container">
        <a class="dex-link official show" href="${officialDexURL}" target="_blank">View on Pokémon.com</a>
        <a class="dex-link serebii show" href="${serebiiURL}" target="_blank">View on Serebii</a>
        <a class="dex-link bulbapedia show" href="${bulbapediaURL}" target="_blank">View on Bulbapedia</a>
      </div>
    `;
  }

  if (randomBtn && typeDropdown && searchResult) {
    randomBtn.addEventListener("click", async function () {
      const selectedType = typeDropdown.value;

      try {
        const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1011");
        const data = await response.json();

        const pokemonData = await Promise.all(
          data.results.map(async (pokemon) => {
            const detailsResponse = await fetch(pokemon.url);
            return await detailsResponse.json();
          })
        );

        const filteredList = pokemonData
          .filter(p => (selectedType === "all" || p.types.some(t => t.type.name === selectedType)))
          .filter(p => p.id <= 1010);

        if (filteredList.length === 0) {
          alert("No Pokémon found for this type!");
          return;
        }

        const randomPokemon = filteredList[Math.floor(Math.random() * filteredList.length)];
        displayPokemon(randomPokemon);
      } catch (error) {
        console.error("Error fetching Pokémon data:", error);
        alert("Failed to fetch Pokémon data. Please try again.");
      }
    });
  }

  if (searchBtn && searchInput && searchResult) {
    searchBtn.addEventListener("click", async function () {
      const rawQuery = searchInput.value.trim();
      if (!rawQuery) {
        alert("Please enter a Pokémon name!");
        return;
      }

      const formattedQuery = normalizePokemonName(rawQuery);

      try {
        const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${formattedQuery}`);
        if (!res.ok) {
          alert("Pokémon not found!");
          return;
        }

        const pokemon = await res.json();

        if (pokemon.id > 1010) {
          alert("This Pokémon isn't supported in this Pokédex.");
          return;
        }

        displayPokemon(pokemon);
      } catch (error) {
        console.error("Search failed:", error);
        alert("Error retrieving Pokémon.");
      }
    });
  }

  if (randomTypeBtn) {
    const pages = [
      "fire.html", "water.html", "grass.html", "electric.html", "psychic.html",
      "ice.html", "dragon.html", "dark.html", "fairy.html", "bug.html",
      "rock.html", "ground.html", "poison.html", "fighting.html", "steel.html",
      "ghost.html", "normal.html"
    ];
    randomTypeBtn.addEventListener("click", function () {
      const randomIndex = Math.floor(Math.random() * pages.length);
      window.location.href = pages[randomIndex];
    });
  }
});

