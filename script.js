document.addEventListener('DOMContentLoaded', () => {
    const pokemonContainer = document.getElementById('pokemonContainer');
    const searchInput = document.getElementById('searchInput');
    const typeFilter = document.getElementById('typeFilter');
    const modal = document.getElementById('pokemonModal');
    const modalContent = document.getElementById('modalContent');
    const closeModal = document.getElementsByClassName('close')[0];

    closeModal.onclick = function() {
        modal.style.display = "none";
    };

    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    };

    function fetchPokemons() {
        fetch('https://pokeapi.co/api/v2/pokemon?limit=151')
            .then(response => response.json())
            .then(data => {
                displayPokemons(data.results);
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
                        type.textContent = typeInfo.type.name.charAt(0).toUpperCase() + typeInfo.type.name.slice(1);
                        type.classList.add(`type-${typeInfo.type.name.toLowerCase()}`); // Appliquer la classe de type
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
        modalContent.innerHTML = `
            <div class="modal-header">
                <h2>${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)} (#${pokemon.id})</h2>
                <span class="close">&times;</span>
            </div>
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
            <div>
                <h3>About</h3>
                <p>Height: ${pokemon.height / 10} m</p>
                <p>Weight: ${pokemon.weight / 10} kg</p>
                <p>Abilities: ${pokemon.abilities.map(ability => ability.ability.name).join(', ')}</p>
            </div>
            <div class="modal-stats">
                <h3>Stats</h3>
                ${pokemon.stats.map(stat => `
                    <div>
                        <span>${stat.stat.name.toUpperCase()}:</span>
                        <span>${stat.base_stat}</span>
                    </div>
                `).join('')}
            </div>
        `;

        modal.style.display = "block";

        document.getElementsByClassName('close')[0].onclick = function() {
            modal.style.display = "none";
