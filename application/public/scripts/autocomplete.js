const input = document.getElementById('autocomplete-input');
const suggestionsContainer = document.getElementById('autocomplete-suggestions');

input.addEventListener('input', () => {
    const inputValue = input.value.toLowerCase();
    suggestionsContainer.innerHTML = '';
    if (inputValue) {
      suggestionsContainer.classList.add('show');
        fetch(`/suggestions?q=${inputValue}`)
            .then(response => response.json())
            .then(suggestions => {
                suggestions.forEach(suggestion => {
                    const suggestionDiv = document.createElement('a');
                    //suggestionDiv.setAttribute("href", "/recipes")
                    suggestionDiv.classList.add('autocomplete-suggestion');
                    suggestionDiv.innerText = suggestion;
                    suggestionDiv.addEventListener('click', () => {
                        input.value = suggestion;
                        suggestionsContainer.innerHTML = '';
                    });
                    suggestionsContainer.appendChild(suggestionDiv);
                });
            })
            .catch(err => {
                console.error('Error fetching suggestions:', err);
            });
    }
});

