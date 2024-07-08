document.addEventListener('DOMContentLoaded', () => {

    // Sélection des éléments HTML nécessaires
    const pokemonContainer = document.getElementById('pokemonContainer');
    const searchInput = document.getElementById('searchInput');
    const typeFilter = document.getElementById('typeFilter');
    const modal = document.getElementById('pokemonModal');
    const modalContent = document.getElementById('modalContent');
    const closeModal = document.querySelector('.close');
    const resetButton = document.getElementById('resetButton');

    let pokemonData = [];
    let pokemonDetails = [];

    // Chargement des Types de Pokémon en français
    fetch('https://pokeapi.co/api/v2/type')
        .then(response => response.json())
        .then(data => {
            const types = data.results;
            types.forEach(type => {
                fetch(type.url)
                    .then(response => response.json())
                    .then(typeData => {
                        const option = document.createElement('option');
                        const frenchNameEntry = typeData.names.find(name => name.language.name === 'fr');
                        option.value = type.name;
                        option.textContent = frenchNameEntry ? frenchNameEntry.name : type.name;
                        typeFilter.appendChild(option);
                    });
            });
        });

    // Chargement des Pokémon de la Première Génération
    fetch('https://pokeapi.co/api/v2/pokemon?limit=151')
        .then(response => response.json())
        .then(data => {
            const pokemons = data.results;
            pokemonData = pokemons;
            loadPokemonDetails(pokemons);
        });

    // Chargement des détails des Pokémon
    function loadPokemonDetails(pokemons) {
        Promise.all(pokemons.map(pokemon => fetch(pokemon.url).then(response => response.json()))).then(details => {
            Promise.all(details.map(detail => fetch(detail.species.url).then(response => response.json()).then(speciesData => {
                const frenchNameEntry = speciesData.names.find(entry => entry.language.name === 'fr');
                detail.frenchName = frenchNameEntry ? frenchNameEntry.name : detail.name;
                return detail;
            }))).then(detailsInFrench => {
                pokemonDetails = detailsInFrench;
                displayPokemons(detailsInFrench);
            });
        });
    }

    // Filtrage des Pokémon par Nom et Type
    searchInput.addEventListener('input', () => {
        filterPokemons();
    });

    typeFilter.addEventListener('change', () => {
        filterPokemons();
    });

    function filterPokemons() {
        const searchTerm = searchInput.value.toLowerCase();
        const selectedType = typeFilter.value;

        let filteredPokemons = pokemonDetails.filter(pokemon => {
            return pokemon.frenchName.toLowerCase().includes(searchTerm);
        });

        if (selectedType) {
            const typeUrl = `https://pokeapi.co/api/v2/type/${selectedType}`;
            fetch(typeUrl)
                .then(response => response.json())
                .then(typeData => {
                    const typePokemons = typeData.pokemon.map(p => p.pokemon.name);
                    const finalFilteredPokemons = filteredPokemons.filter(p => typePokemons.includes(p.name));
                    displayPokemons(finalFilteredPokemons);
                });
        } else {
            displayPokemons(filteredPokemons);
        }
    }

    function displayPokemons(pokemons) {
        pokemonContainer.innerHTML = '';
        pokemons.sort((a, b) => a.id - b.id).forEach(pokemon => {
            const pokemonCard = document.createElement('div');
            pokemonCard.classList.add('pokemonCard');

            const pokemonImage = document.createElement('img');
            pokemonImage.src = pokemon.sprites.front_default;

            const pokemonNumber = document.createElement('h3');
            pokemonNumber.textContent = `#${pokemon.id}`;

            const pokemonNameElement = document.createElement('h3');
            pokemonNameElement.textContent = pokemon.frenchName.charAt(0).toUpperCase() + pokemon.frenchName.slice(1);

            const pokemonTypes = document.createElement('div');
            pokemonTypes.classList.add('pokemonType');
            pokemon.types.forEach(typeInfo => {
                fetch(typeInfo.type.url)
                    .then(response => response.json())
                    .then(typeData => {
                        const type = document.createElement('span');
                        const typeNameEntry = typeData.names.find(entry => entry.language.name === 'fr');
                        type.textContent = typeNameEntry ? typeNameEntry.name : typeInfo.type.name;
                        type.classList.add(typeInfo.type.name);
                        pokemonTypes.appendChild(type);
                    });
            });

            pokemonCard.appendChild(pokemonImage);
            pokemonCard.appendChild(pokemonNumber);
            pokemonCard.appendChild(pokemonNameElement);
            pokemonCard.appendChild(pokemonTypes);
            pokemonContainer.appendChild(pokemonCard);

            pokemonCard.addEventListener('click', () => {
                showPokemonDetails(pokemon);
            });
        });
    }

    function showPokemonDetails(pokemon) {
        fetch(pokemon.species.url)
            .then(response => response.json())
            .then(speciesData => {
const descriptionEntry = speciesData.flavor_text_entries.find(entry => entry.language.name === 'fr');
const description = descriptionEntry ? descriptionEntry.flavor_text : 'Description non disponible';
const abilities = pokemon.abilities.map(ability => {
    return fetch(ability.ability.url)
        .then(response => response.json())
        .then(abilityData => {
            const abilityNameEntry = abilityData.names.find(entry => entry.language.name === 'fr');
            return abilityNameEntry ? abilityNameEntry.name : ability.ability.name;
        });
});

Promise.all(abilities).then(abilitiesInFrench => {
    const abilitiesText = abilitiesInFrench.join(', ');

    const frenchNameEntry = speciesData.names.find(entry => entry.language.name === 'fr');
    const pokemonName = frenchNameEntry ? frenchNameEntry.name : pokemon.name;

    const animatedImageUrl = pokemon.sprites.versions['generation-v']['black-white'].animated.front_default;

    modalContent.innerHTML = `
        <div class="modal-header">
            <h2>${pokemonName.charAt(0).toUpperCase() + pokemonName.slice(1)} (#${pokemon.id})</h2>
            <button id="playCryButton">🔊</button>
        </div>
        <img src="${animatedImageUrl}" alt="${pokemonName}" class="img-pokemon">
        <p class="height"> ${pokemon.height / 10} m</p>
        <p class="weight"> ${pokemon.weight / 10} kg</p>
        <p class="abilities"> ${abilitiesText}</p>
        <p class="intro">${description}</p>
        <div class="modal-stats">
            <h3> Stats </h3>
            ${pokemon.stats.map(stat => `
                <div>
                    <span>${stat.stat.name.toUpperCase()}:</span>
                    <span>${stat.base_stat}</span>
                </div>
            `).join('')}
        </div>
    `;
    modal.style.display = "block";

    const playCryButton = document.getElementById('playCryButton');
    playCryButton.addEventListener('click', () => {
        const audio = new Audio(`https://veekun.com/dex/media/pokemon/cries/${pokemon.id}.ogg`);
        audio.play();
    });
});

                });
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

    resetButton.addEventListener('click', () => {
        searchInput.value = '';
        typeFilter.value = '';
        displayPokemons(pokemonDetails);
    });
});