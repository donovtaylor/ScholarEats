document.addEventListener('DOMContentLoaded', function() {
    const input = document.getElementById('autocomplete-input');
    const suggestionsContainer = document.getElementById('autocomplete-suggestions');

    input.addEventListener('input', () => {
        const inputValue = input.value.toLowerCase();
        suggestionsContainer.innerHTML = '';

        if (inputValue) {
            fetch(`/autocomplete/suggestions?q=${inputValue}`)
                .then(response => response.json())
                .then(suggestions => {
                    suggestions.forEach(suggestion => {
                        const suggestionDiv = document.createElement('div');
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
});
