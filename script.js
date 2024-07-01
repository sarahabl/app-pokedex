document.addEventListener('DOMContentLoaded', () => {
    const pokemonContainer = document.getElementById('pokemonContainer');
    const searchInput = document.getElementById('searchInput');
    const typeFilter = document.getElementById('typeFilter');
    const modal = document.getElementById('pokemonModal');
    const modalContent = document.getElementById('modalContent');
    const closeModal = document.querySelector('.close');

    fetch('https://pokeapi.co/api/v2/type')
        .then(response => response.json())
        .then(data => {
            const types = data.results;
            types.forEach(type => {
                const option = document.createElement('option');
                option.value = type.name;
                option.textContent = type.name.charAt(0).toUpperCase() + type.name.slice(1);
                typeFilter.appendChild(option);
            });
        });

    fetch('https://pokeapi.co/api/v2/pokemon?limit=151')
        .then(response => response.json())
        .then(data => {
            const pokemons = data.results;
            displayPokemons(pokemons);
        });

    searchInput.addEventListener('input', () => {
        filterPokemons();
    });

    typeFilter.addEventListener('change', () => {
        filterPokemons();
    });

    function filterPokemons() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedType = typeFilter.value;

        fetch('https://pokeapi.co/api/v2/pokemon?limit=151')
            .then(response => response.json())
            .then(data => {
                const filteredPokemons = data.results.filter(pokemon => {
                    return pokemon.name.includes(searchTerm);
                });

                if (selectedType) {
                    const typeUrl = `https://pokeapi.co/api/v2/type/${selectedType}`;
                    fetch(typeUrl)
                        .then(response => response.json())
                        .then(typeData => {
                            const typePokemons = typeData.pokemon.map(p => p.pokemon);
                            const finalFilteredPokemons = filteredPokemons.filter(p => typePokemons.find(tp => tp.name === p.name));
                            displayPokemons(finalFilteredPokemons);
                        });
                } else {
                    displayPokemons(filteredPokemons);
                }
            });
    }

    function displayPokemons(pokemons) {
        pokemonContainer.innerHTML = '';
        pokemons.forEach(pokemon => {
            fetch(pokemon.url)
                .then(response => response.json())
                .then(data => {
                    const pokemonCard = document.createElement('div');
                    pokemonCard.classList.add('pokemonCard');

                    const pokemonImage = document.createElement('img');
                    pokemonImage.src = data.sprites.front_default;

                    const pokemonName = document.createElement('h3');
                    pokemonName.textContent = data.name.charAt(0).toUpperCase() + data.name.slice(1);

                    const pokemonTypes = document.createElement('div');
                    pokemonTypes.classList.add('pokemonType');
                    data.types.forEach(typeInfo => {
                        const type = document.createElement('span');
                        type.textContent = typeInfo.type.name;
                        pokemonTypes.appendChild(type);
                    });

                    pokemonCard.appendChild(pokemonImage);
                    pokemonCard.appendChild(pokemonName);
                    pokemonCard.appendChild(pokemonTypes);
                    pokemonContainer.appendChild(pokemonCard);

                    pokemonCard.addEventListener('click', () => {
                        showPokemonDetails(data);
                    });
                });
        });
    }

    function showPokemonDetails(pokemon) {
        fetch(pokemon.species.url)
            .then(response => response.json())
            .then(speciesData => {
                const description = speciesData.flavor_text_entries.find(entry => entry.language.name === 'en').flavor_text;
                const abilities = pokemon.abilities.map(ability => ability.ability.name).join(', ');

                modalContent.innerHTML = `
                    <div class="modal-header">
                        <h2>${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)} (#${pokemon.id})</h2>
                    </div>
                    <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
                    <p>Height: ${pokemon.height / 10} m</p>
                    <p>Weight: ${pokemon.weight / 10} kg</p>
                    <p>Abilities: ${abilities}</p>
                    <p>${description}</p>
                    <div class="modal-stats">
                        ${pokemon.stats.map(stat => `
                            <div>
                                <span>${stat.stat.name.toUpperCase()}:</span>
                                <span>${stat.base_stat}</span>
                            </div>
                        `).join('')}
                    </div>
                `;
                modal.style.display = "block";
            });
    }

    closeModal.addEventListener('click', () => {
        modal.style.display = "none";
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });
});
