/*****************************************
* Description: Handling the "reserve" button in the individual recipes page
*****************************************/

const debug = true;

function debugMsg(input) { // Use this for debug messages, I got tired of doing a ton of if (debug) statements
	if (debug) {
		console.log(input);
	}
} // NOTE: For some reason console logs do not appear on event listeners. Debug using reserveRecipeButton_BE.js instead

document.addEventListener('DOMContentLoaded', function () {
	const reserveRecipeButton = document.getElementById('reserveRecipeButton');
	debugMsg(`RESERVE RECIPE EVENT LISTENING...`)


	if (reserveRecipeButton) {
		reserveRecipeButton.addEventListener('click', () => {

			debugMsg(`RESERVE RECIPE BUTTON CLICKED`)

			const recipeId = reserveRecipeButton.getAttribute('recipeInfo'); // Check this if broken, I think I have one too many things named "recipeId"
			debugMsg('BUTTON RECIPE ID: ', recipeId);

			fetch(`/recipes/${recipeId}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ recipeId })
			})
				.then(response => response.json())
				.then(data => {
					if (data.error) {
						alert(data.error);
					} else {
						alert(data.message);
						window.location.href = `/recipes/${recipeId}`; // Gets the user back to the recipe page
					}
				})
				.catch(error => {
					console.error('Error:', error);
				});
		});
	}
});
