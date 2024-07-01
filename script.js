document.addEventListener('DOMContentLoaded', () => {
    const pokemonContainer = document.getElementById('pokemonContainer');
    const searchInput = document.getElementById('searchInput');

    fetch('https://pokeapi.co/api/v2/pokemon?limit=151')
        .then(response => response.json())
        .then(data => {
            const pokemons = data.results;
            displayPokemons(pokemons);
        });

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const pokemonCards = document.querySelectorAll('.pokemonCard');
        pokemonCards.forEach(card => {
            const pokemonName = card.querySelector('h3').textContent.toLowerCase();
            if (pokemonName.includes(searchTerm)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    });

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
                    pokemonName.textContent = data.name;

                    pokemonCard.appendChild(pokemonImage);
                    pokemonCard.appendChild(pokemonName);

                    pokemonContainer.appendChild(pokemonCard);
                });
        });
    }
});
