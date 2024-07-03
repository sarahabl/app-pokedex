document.addEventListener('DOMContentLoaded', () => {
    
    // Sélection des éléments HTML nécessaires
    const pokemonContainer = document.getElementById('pokemonContainer');
    const searchInput = document.getElementById('searchInput');
    const typeFilter = document.getElementById('typeFilter');
    const modal = document.getElementById('pokemonModal');
    const modalContent = document.getElementById('modalContent');
    const closeModal = document.querySelector('.close');
    const resetButton = document.getElementById('resetButton'); // Ajout du bouton de réinitialisation

    // Chargement des Types de Pokémon
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

    // Chargement des Pokémon de la Première Génération
    fetch('https://pokeapi.co/api/v2/pokemon?limit=151')
        .then(response => response.json())
        .then(data => {
            const pokemons = data.results;
            displayPokemons(pokemons);
        });

    // Filtrage des Pokémon par Nom et Type
    searchInput.addEventListener('input', () => {
        filterPokemons();
    });

    typeFilter.addEventListener('change', () => {
        filterPokemons();
    });

    // Filtrage des Pokémon 
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

    // Affichage des Pokémon
    function displayPokemons(pokemons) {
        pokemonContainer.innerHTML = '';
        pokemons.forEach(pokemon => {
            fetch(pokemon.url)
                .then(response => response.json())
                .then(data => {
                    const pokemonCard = document.createElement('div');
                    pokemonCard.classList.add('pokemonCard');

                    const pokemonImage = document.createElement('img');
                    pokemonImage.src = data.sprites.versions['generation-v']['black-white'].animated.front_default; // Utilisation de l'image animée

                    const pokemonName = document.createElement('h3');
                    pokemonName.textContent = data.name.charAt(0).toUpperCase() + data.name.slice(1);

                    const pokemonTypes = document.createElement('div');
                    pokemonTypes.classList.add('pokemonType');
                    data.types.forEach(typeInfo => {
                        const type = document.createElement('span');
                        type.textContent = typeInfo.type.name;
                        type.classList.add(typeInfo.type.name); // Ajout de la classe dynamique
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

    // Affichage des Détails des Pokémon
    function showPokemonDetails(pokemon) {
        fetch(pokemon.species.url)
            .then(response => response.json())
            .then(speciesData => {
                const description = speciesData.flavor_text_entries.find(entry => entry.language.name === 'fr').flavor_text;
                const abilities = pokemon.abilities.map(ability => ability.ability.name).join(', ');

                // Récupération de l'image animée pour la carte modale
                const animatedImageUrl = pokemon.sprites.versions['generation-v']['black-white'].animated.front_default;

                modalContent.innerHTML = `
                    <div class="modal-header">
                        <h2 class="name-pokemon">${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)} (#${pokemon.id})</h2>
                        <button id="playCryButton">L'écouter</button>
                    </div>
                    <img src="${animatedImageUrl}" alt="${pokemon.name}" class="img-pokemon">
                    <p class="height"> ${pokemon.height / 10} m</p>
                    <p class="weight"> ${pokemon.weight / 10} kg</p>
                    <p class="abilities"> ${abilities}</p>
                    <p class="intro">${description}</p>
                `;
                modal.style.display = "block";

                // Ajouter le gestionnaire d'événements pour le bouton de lecture
                const playCryButton = document.getElementById('playCryButton');
                playCryButton.addEventListener('click', () => {
                    const audio = new Audio(`https://veekun.com/dex/media/pokemon/cries/${pokemon.id}.ogg`);
                    audio.play();
                });
            });
    }

    // Fermeture de la Modale
    closeModal.addEventListener('click', () => {
        modal.style.display = "none";
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    });

    // Bouton pour réinitialiser les champs de recherche et de filtre
    resetButton.addEventListener('click', () => {
        searchInput.value = '';
        typeFilter.value = '';
        fetch('https://pokeapi.co/api/v2/pokemon?limit=151')
            .then(response => response.json())
            .then(data => {
                const pokemons = data.results;
                displayPokemons(pokemons);
            });
    });
});