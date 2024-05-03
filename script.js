document.addEventListener('DOMContentLoaded', () => {
    const searchButton = document.querySelector('.buttonSearch');
    const entrada = document.getElementById('in1');
    const buttonEvolution = document.querySelector('.buttonEvolution');
    const ContainerError = document.querySelector('.containerError');
    const pokename = document.querySelector('.pokemonName');
    const containerInfo = document.querySelector('.containerInfo');
    const abilitiesElement = document.querySelector('.pokemonAbilities');
    const imgElement = document.querySelector('.pokemonImg');
    const typeElement = document.querySelector('.pokemonType');
    const descriptionElement = document.querySelector('.pokemonDescrition');

    const containerEvolution = document.querySelector('.containerEvolution');

    let nextPokemon = '';
  
    searchButton.addEventListener('click', () => {
        const pokemonName = entrada.value.trim().toLowerCase();
      
        if (pokemonName === '') {
            showError('Ingrese el nombre de un Pokémon');
            return;
        }
  
      getPokemonData(pokemonName)
        .then((pokemonData) => {
            mostrarInfo(pokemonData);
        })
        .catch((error) => {
            showError('Vaya! algo salió mal.');
        });
    });
  
    function getSpeciesData(speciesURL) {
        return axios.get(speciesURL)

        .then((response) => response.data)
        .catch((error) => {
            throw new Error('URL de la especie no encontrada');
        });
    }
  
    function getEvolutionChainData(evolutionChainURL) {
        return axios.get(evolutionChainURL)

        .then((response) => response.data)
        .catch((error) => {
            throw new Error('Información no encontrada');
        });
    }
  
    function getPokemonData(name) {
        return axios.get(`https://pokeapi.co/api/v2/pokemon/${name}`)
        
        .then((response) => {
            const pokemonData = response.data;
            const speciesURL = pokemonData.species.url;
            return { ...pokemonData, speciesURL };
        })

        .catch((error) => {
            throw new Error('Pokémon no encontrado');
        });
    }
  
    function mostrarInfo(pokemonData) {
        pokename.textContent = capitalizeFirstLetter(pokemonData.name);
        imgElement.src = pokemonData.sprites.front_default || '';
        typeElement.textContent = pokemonData.types.map(type => type.type.name).join(', ');
        abilitiesElement.textContent = pokemonData.abilities.map(ability => ability.ability.name).join(', ');
  
        const speciesURL = pokemonData.speciesURL;
  
        getSpeciesData(speciesURL)
        
        .then((speciesData) => {
            const flavorTextEntries = speciesData.flavor_text_entries.filter(entry => entry.language.name === 'es');
        
            if (flavorTextEntries.length > 0) {
                descriptionElement.textContent = flavorTextEntries[0].flavor_text;
            }

            if (speciesData.evolution_chain.url) {
                const evolutionChainURL = speciesData.evolution_chain.url;
                return getEvolutionChainData(evolutionChainURL);
            } 
            else {
                throw new Error('URL no encontrada');
            }
        })

        .then((evolutionChainData) => {
            if (hayevolution(evolutionChainData, pokemonData.species.name)) {
                containerEvolution.style.display = 'flex';
                nextPokemon = findNextEvolution(evolutionChainData.chain, pokemonData.species.name);
            } 
            else {
                containerEvolution.style.display = 'none';
                nextPokemon = '';
            }
        })
        .catch((error) => {
            descriptionElement.textContent = 'Descripción no disponible';
            containerEvolution.style.display = 'none';
        });
  
        containerInfo.style.display = 'flex';
        ContainerError.style.display = 'none';
    }
  
    function showError(message) {
        ContainerError.querySelector('p').textContent = message;
        ContainerError.style.display = 'flex';
        containerInfo.style.display = 'none';
    }
  
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
  
    function hayevolution(evolutionChainData, speciesName) {
        function traverseChain(chain) {
            if (chain.species.name === speciesName) {
                if (chain.evolves_to && chain.evolves_to.length > 0) {
                    return true; 
                } else {
                    return false; 
                }
            } else {
                if (chain.evolves_to && chain.evolves_to.length > 0) {
                    for (let i = 0; i < chain.evolves_to.length; i++) {
                        if (traverseChain(chain.evolves_to[i])) {
                            return true; 
                        }
                    }
                }
            }
            return false; 
        }
        return traverseChain(evolutionChainData.chain);
    }
    
    

    function findNextEvolution(chain, currentSpeciesName) {
        function traverseChain(chain) {
            if (chain.species.name === currentSpeciesName) {
                if (chain.evolves_to.length > 0) {
                    return chain.evolves_to[0].species.name;
                }
            } else {
                for (let i = 0; i < chain.evolves_to.length; i++) {
                    const nextEvolution = traverseChain(chain.evolves_to[i]);
                    if (nextEvolution) {
                        return nextEvolution;
                    }
                }
            }
            return null;
        }
    
        return traverseChain(chain);
    }

    buttonEvolution.addEventListener('click', () => {

        if (nextPokemon === '') {
            showError('No hay más evoluciones');
            containerEvolution.style.display = 'none';
            return;
        }

        getPokemonData(nextPokemon)
        .then((pokemonData) => {
            mostrarInfo(pokemonData);
        })
        .catch((error) => {
            showError('Vaya! algo salió mal.');
        });
    });
});
  