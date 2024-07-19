document.addEventListener("DOMContentLoaded", function() {
    const changePasswordForm = document.getElementById('change-password-form');
    const changeUsernameForm = document.getElementById('change-username-form');
    const setDietaryRestrictionsForm = document.getElementById('change-dietary-restrictions');
    const setAllergies = document.getElementById('change-allergies-from');

    // Allows us to change password
    changePasswordForm.addEventListener("submit", function(event){
        event.preventDefault();
        const currentPass = document.getElementById("current-password").value;
        const newPass = document.getElementById("new-password").value;
        const confirmPass = document.getElementById("verify-password").value;
    
        fetch('/users/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ newPass, currentPass, confirmPass })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert(data.error);
            } else if (data.message) {
                alert(data.message);
                location.reload();
            } else {
                alert('Unexpected response from the server.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An unexpected error occurred.');
        });
    });

    //Allows the user to change their username
    changeUsernameForm.addEventListener("submit", function(event){
        event.preventDefault();
        const newUsername = document.getElementById("new-username").value;
        console.log("New Username: ", newUsername);

        fetch('/users/change-username', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ newUsername })
        })
        .then(response => response.text())
        .then(data => {
            alert(data);
            location.reload();
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });

    setDietaryRestrictionsForm.addEventListener('submit', function(event) {
        event.preventDefault();
        const checkboxes = document.querySelectorAll('.dropdown_option');
        const dietaryRestrictions = [];
        checkboxes.forEach((checkbox) => {
            if (checkbox.checked) {
                dietaryRestrictions.push(checkbox.value);
            }
        });
        console.log(dietaryRestrictions);

        fetch('/users/set-dietary-restrictions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ dietary_restrictions: dietaryRestrictions })
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            location.reload();
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });

    setAllergies.addEventListener('submit', function(event) {
        event.preventDefault();
        const checkboxes = document.querySelectorAll('.dropdown_option');
        const allergies = [];
        checkboxes.forEach((checkbox) => {
            if (checkbox.checked) {
                allergies.push(checkbox.value);
            }
        });

        fetch('/users/set-allergies', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ allergies: allergies })
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            location.reload();
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });

})