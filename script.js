const searchButton = document.querySelector('#searchButton');
const input = document.querySelector('#pokemonInput');
const tableContainer = document.querySelector('#pokemonTableContainer');
const statusMessage = document.querySelector('#statusMessage');

const POKEMON_BASE_URL = 'https://pokeapi.co/api/v2/pokemon/';
const SPECIES_BASE_URL = 'https://pokeapi.co/api/v2/pokemon-species/';

function showStatus(message, isError = false) {
  statusMessage.textContent = message;
  statusMessage.style.color = isError ? 'red' : 'black';
}

function clearStatus() {
  statusMessage.textContent = '';
}

function createRetryButton(pokemonName) {
  const retryPrompt = document.createElement('button');
  retryPrompt .textContent = "Retry";
  retryPrompt .onclick = () => fetchPokemon(pokemonName);
  return retryPrompt;
}

async function fetchPokemon(pokemonNameInput) {
  const pokemonName = (pokemonNameInput || input.value).toLowerCase().trim();
  if (!pokemonName) {
    showStatus("Please enter a Pokémon name or ID", true);
    return;
  }

  showStatus("Loading... Please wait ⏳");
  tableContainer.innerHTML = '';

  try {
    // Fetch data from both APIs
    const [pokemonRes, speciesRes] = await Promise.all([
      axios.get(`${POKEMON_BASE_URL}${pokemonName}`),
      axios.get(`${SPECIES_BASE_URL}${pokemonName}`)
    ]);

    const pokemon = pokemonRes.data;
    const species = speciesRes.data;
    const powerIndex = pokemon.stats.reduce((sum, s) => sum + s.base_stat, 0);

    setTimeout(() => {
      clearStatus();

      const table = document.createElement('table');
      table.id = 'pokemonTable';

      table.innerHTML = `
        <thead>
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>Type(s)</th>
            <th>HP</th>
            <th>Attack</th>
            <th>Defense</th>
            <th>Color</th>
            <th>Habitat</th>
            <th>Power Index ⚡</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><img src="${pokemon.sprites.front_default}" class="pokemon-photo" alt="${pokemon.name}"></td>
            <td>${pokemon.name.toUpperCase()}</td>
            <td>${pokemon.types.map(t => t.type.name).join(', ')}</td>
            <td>${pokemon.stats.find(s => s.stat.name === 'hp').base_stat}</td>
            <td>${pokemon.stats.find(s => s.stat.name === 'attack').base_stat}</td>
            <td>${pokemon.stats.find(s => s.stat.name === 'defense').base_stat}</td>
            <td>${species.color?.name || '—'}</td>
            <td>${species.habitat?.name || '—'}</td>
            <td>${powerIndex}</td>
          </tr>
        </tbody>
      `;

      tableContainer.appendChild(table);
    }, 250); 

  } catch (err) {
    console.error(err);
    showStatus(`Pokémon not found.`, true);
    const retryPrompt = createRetryButton(pokemonName);
    tableContainer.appendChild(retryPrompt);
  }
}

searchButton.addEventListener('click', () => fetchPokemon());