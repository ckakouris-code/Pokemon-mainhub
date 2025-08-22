// JavaScript for Pokémon Team Builder with only 4 text/autocomplete move fields per Pokémon

const team = [];

// Load team from localStorage if available
function loadTeamFromStorage() {
  try {
    const saved = localStorage.getItem('pkmn-team');
    if (saved) {
      const arr = JSON.parse(saved);
      // Only restore basic info, not full API data
      arr.forEach(p => team.push(p));
    }
  } catch (e) {}
}

// Save team to localStorage
function saveTeamToStorage() {
  try {
    // Only save minimal info needed to restore team
    const arr = team.map(p => ({
      id: p.id,
      name: p.name,
      selectedMoves: p.selectedMoves || [],
      selectedNature: p.selectedNature || '',
      selectedAbility: p.selectedAbility || ''
    }));
    localStorage.setItem('pkmn-team', JSON.stringify(arr));
  } catch (e) {}
}
if (typeFilter) {
  typeFilter.addEventListener('change', async function() {
    selectedTypeFilter = this.value;
    await renderPokemonDropdown();
  });
}

// Update renderPokemonDropdown to filter by type
async function renderPokemonDropdown() {
  let dropdown = document.getElementById('pokemon-dropdown');
  if (!dropdown) {
    dropdown = document.createElement('select');
    dropdown.id = 'pokemon-dropdown';
    dropdown.style.marginRight = '8px';
    searchInput.parentNode.insertBefore(dropdown, searchInput);
    dropdown.addEventListener('change', function() {
      searchInput.value = this.value;
    });
  }
  let filteredNames = allPokemonNames;
  if (selectedTypeFilter) {
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/type/${selectedTypeFilter}`);
      const data = await res.json();
      const typePokemon = data.pokemon.map(p => p.pokemon.name);
      filteredNames = allPokemonNames.filter(name => typePokemon.includes(name));
    } catch (e) {
      filteredNames = [];
    }
  }
  dropdown.innerHTML = '<option value="">Select Pokémon</option>' +
    filteredNames.map(name => `<option value="${name}">${name.charAt(0).toUpperCase() + name.slice(1)}</option>`).join('');
}

function getMoveUrl(moveName, site = 'serebii') {
  if (!moveName) return '#';
  const formatted = moveName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  if (site === 'serebii') {
    // Serebii uses /attackdex/xy/{move}.shtml
    return `https://www.serebii.net/attackdex-sv/${formatted}.shtml`;
  } else if (site === 'bulbapedia') {
    // Bulbapedia uses /wiki/{Move_name}_(move)
    const bpName = moveName.replace(/ /g, '_').replace(/'/g, '%27');
    return `https://bulbapedia.bulbagarden.net/wiki/${bpName}_(move)`;
  }
  return '#';
}

// List of all Pokémon natures
const natures = [
  'Hardy', 'Lonely', 'Brave', 'Adamant', 'Naughty',
  'Bold', 'Docile', 'Relaxed', 'Impish', 'Lax',
  'Timid', 'Hasty', 'Serious', 'Jolly', 'Naive',
  'Modest', 'Mild', 'Quiet', 'Bashful', 'Rash',
  'Calm', 'Gentle', 'Sassy', 'Careful', 'Quirky'
];

// Nature stat modifiers (use API stat names)
const natureModifiers = {
  Hardy:    [null, null], Lonely:   ['attack', 'defense'], Brave:   ['attack', 'speed'], Adamant: ['attack', 'special-attack'], Naughty: ['attack', 'special-defense'],
  Bold:   ['defense', 'attack'], Docile:   [null, null], Relaxed: ['defense', 'speed'], Impish: ['defense', 'special-attack'], Lax: ['defense', 'special-defense'],
  Timid:  ['speed', 'attack'], Hasty:   ['speed', 'defense'], Serious: [null, null], Jolly: ['speed', 'special-attack'], Naive: ['speed', 'special-defense'],
  Modest: ['special-attack', 'attack'], Mild: ['special-attack', 'defense'], Quiet: ['special-attack', 'speed'], Bashful: [null, null], Rash: ['special-attack', 'special-defense'],
  Calm: ['special-defense', 'attack'], Gentle: ['special-defense', 'defense'], Sassy: ['special-defense', 'speed'], Careful: ['special-defense', 'special-attack'], Quirky: [null, null]
};

function getModifiedStats(baseStats, nature) {
  if (!nature || !natureModifiers[nature]) return baseStats.map(s => ({...s, mod: s.base_stat}));
  const [up, down] = natureModifiers[nature];
  return baseStats.map(s => {
    let mod = s.base_stat;
    if (s.stat.name === up) mod = Math.floor(mod * 1.1);
    if (s.stat.name === down) mod = Math.floor(mod * 0.9);
    return {...s, mod, up: s.stat.name === up, down: s.stat.name === down};
  });
}

// Update renderTeam to make move fields linkable if filled

function renderTeam() {
  teamContainer.innerHTML = '';
  team.forEach((pokemon, idx) => {
    const card = document.createElement('div');
    card.className = 'pokemon-card';
    // Nature dropdown
    const selectedNature = pokemon.selectedNature || '';
    let natureUI = `<div style='margin-bottom:8px;'>
      <label for='nature-${idx}' style='font-size:12px;'>Nature:</label>
      <select id='nature-${idx}' onchange='window.setNature(${idx}, this.value)' style='margin-left:4px;'>
        <option value=''>Select Nature</option>
        ${natures.map(n => `<option value='${n}' ${selectedNature===n?'selected':''}>${n}</option>`).join('')}
      </select>
    </div>`;
    // Abilities dropdown
    let abilitiesUI = '';
    if (pokemon.abilities) {
      const selectedAbility = pokemon.selectedAbility || '';
      abilitiesUI = `<div style='margin-bottom:8px;'>
        <label for='ability-${idx}' style='font-size:12px;'>Ability:</label>
        <select id='ability-${idx}' onchange='window.setAbility(${idx}, this.value)' style='margin-left:4px;'>
          <option value=''>Select Ability</option>
          ${pokemon.abilities.map(a => `<option value='${a.ability.name}' ${selectedAbility===a.ability.name?'selected':''}>${a.ability.name}</option>`).join('')}
        </select>
      </div>`;
    }
    // Stats UI
    let statsUI = '';
    if (pokemon.stats) {
      const selectedNature = pokemon.selectedNature || '';
      const modStats = getModifiedStats(pokemon.stats, selectedNature);
      // Map stat names to display names for clarity
      const statDisplayNames = {
        hp: 'HP',
        attack: 'Attack',
        defense: 'Defense',
        speed: 'Speed',
        'special-attack': 'Sp. Atk',
        'special-defense': 'Sp. Def'
      };
      statsUI = `<div style='margin-bottom:8px;font-size:12px;text-align:left;'>
        <strong>Stats:</strong><br/>
        <table style='width:100%;font-size:12px;'>
          ${modStats.map(s => `<tr><td>${statDisplayNames[s.stat.name] || s.stat.name.toUpperCase()}</td><td style='text-align:right;${s.up?'color:#388e3c;font-weight:bold;':''}${s.down?'color:#d32f2f;font-weight:bold;':''}'>${s.mod}${s.up ? ' ▲' : ''}${s.down ? ' ▼' : ''}</td></tr>`).join('')}
        </table>
      </div>`;
    }
    // Moves UI
    let movesUI = '';
    if (pokemon.moves) {
      const moveList = pokemon.moves.map(mv => mv.move.name);
      // Four text/autocomplete fields
      for (let m = 0; m < maxMoves; m++) {
        const selectedMove = pokemon.selectedMoves && pokemon.selectedMoves[m] ? pokemon.selectedMoves[m] : '';
        const moveUrl = selectedMove ? getMoveUrl(selectedMove, 'serebii') : '#';
        movesUI += `<div style="margin-bottom:4px;">
          <input type="text" placeholder="Type or select..." value="${selectedMove}" oninput="window.autocompleteMove(${idx},${m},this.value)" list="move-list-${idx}" style="width:120px;" />
          ${selectedMove ? `<a href="${moveUrl}" target="_blank" style="font-size:12px;margin-left:4px;">AttackDex</a>` : ''}
          <button type="button" onclick="window.clearMove(${idx},${m})" style="margin-left:4px;font-size:12px;padding:0 6px;">Clear</button>
        </div>`;
      }
      // Datalist for autocomplete (shared for all fields)
      movesUI += `<datalist id="move-list-${idx}">
        ${moveList.map(move => `<option value="${move}"></option>`).join('')}
      </datalist>`;
    }
    card.innerHTML = `
      <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" width="80" height="80"/><br/>
      <strong>${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</strong><br/>
      <button onclick="removeFromTeam(${idx})">Remove</button>
      ${natureUI}
      ${abilitiesUI}
      ${statsUI}
      <div style='margin-top:8px;'>
        <em>Moves:</em>
        ${movesUI}
      </div>
    `;
    teamContainer.appendChild(card);
  });
  addBtn.disabled = team.length >= maxTeamSize;
  saveTeamToStorage();
}


window.removeFromTeam = function(idx) {
  team.splice(idx, 1);
  renderTeam();
};


window.autocompleteMove = function(pokeIdx, moveIdx, moveName) {
  if (!team[pokeIdx].selectedMoves) team[pokeIdx].selectedMoves = Array(maxMoves).fill('');
  team[pokeIdx].selectedMoves[moveIdx] = moveName;
  renderTeam();
};


window.clearMove = function(pokeIdx, moveIdx) {
  if (!team[pokeIdx].selectedMoves) team[pokeIdx].selectedMoves = Array(maxMoves).fill('');
  team[pokeIdx].selectedMoves[moveIdx] = '';
  renderTeam();
};


window.setNature = function(idx, nature) {
  team[idx].selectedNature = nature;
  renderTeam();
};


window.setAbility = function(idx, ability) {
  team[idx].selectedAbility = ability;
  renderTeam();
};


addBtn.addEventListener('click', async () => {
  let query = searchInput.value.trim();
  // If search is empty, use the dropdown value
  if (!query) {
    const dropdown = document.getElementById('pokemon-dropdown');
    if (dropdown && dropdown.value) {
      query = dropdown.value;
      searchInput.value = dropdown.value; // Optionally fill the search field
    }
  }
  if (!query || team.length >= maxTeamSize) return;
  const pokemon = await fetchPokemon(query);
  if (pokemon && !team.some(p => p.id === pokemon.id)) {
    pokemon.selectedMoves = Array(maxMoves).fill('');
    // Restore saved nature/ability/moves if present in localStorage
    const saved = (JSON.parse(localStorage.getItem('pkmn-team')||'[]')).find(p => p.id === pokemon.id);
    if (saved) {
      pokemon.selectedMoves = saved.selectedMoves || Array(maxMoves).fill('');
      pokemon.selectedNature = saved.selectedNature || '';
      pokemon.selectedAbility = saved.selectedAbility || '';
    }
    team.push(pokemon);
    renderTeam();
    searchInput.value = '';
  } else if (pokemon) {
    alert('This Pokémon is already in your team!');
  }
});

// Ensure the search input triggers the add button when Enter is pressed
searchInput.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    addBtn.click();
  }
});


// On page load, restore team from localStorage and fetch Pokémon data for each
window.addEventListener('DOMContentLoaded', async () => {
  loadTeamFromStorage();
  if (team.length > 0) {
    // For each saved team member, fetch full data and restore selections
    for (let i = 0; i < team.length; i++) {
      const saved = team[i];
      const pokemon = await fetchPokemon(saved.name);
      if (pokemon) {
        pokemon.selectedMoves = saved.selectedMoves || Array(maxMoves).fill('');
        pokemon.selectedNature = saved.selectedNature || '';
        pokemon.selectedAbility = saved.selectedAbility || '';
        team[i] = pokemon;
      }
    }
    renderTeam();
  }
  fetchAllPokemonNames();

  // Add Save Team button handler
  const saveBtn = document.getElementById('save-team-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      saveTeamToStorage();
      saveBtn.textContent = 'Saved!';
      setTimeout(() => { saveBtn.textContent = 'Save Team'; }, 1200);
    });
  }
});