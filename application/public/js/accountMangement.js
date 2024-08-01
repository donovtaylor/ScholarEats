document.addEventListener("DOMContentLoaded", function() {
    const themeSelector = document.getElementById('themeSelector');
    const changePasswordForm = document.getElementById('change-password-form');
    const changeUsernameForm = document.getElementById('change-username-form');
    const setDietaryRestrictionsForm = document.getElementById('change-dietary-restrictions');
    const setAllergies = document.getElementById('change-allergies-from');
    const setPronouns = document.getElementById('update-pronouns-form');
    const setBio = document.getElementById('update-bio-form');

    const alertMessage = document.getElementById("alert-message");
    const message = document.getElementById("message");

    setBio.addEventListener('submit', function(event){
        event.preventDefault();
        const bio = document.getElementById('bio').value;
        console.log(bio);
        fetch('users/set-bio', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ bio })
        })
        .then(response => response.json())
        .then(data => {
            message.textContent = data.message;
            message.classList.remove('hidden');
            setTimeout(() => { location.reload(); }, 2000);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });

    themeSelector.addEventListener('submit', function(e) {
      e.preventDefault();
      const mode = document.getElementById('modeSelect').value;
      
      fetch('users/set-mode', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({mode})
      })
      .then(response => response.json())
      .then(data => {
        message.textContent = data.message;
        message.classList.remove('hidden');
        setTimeout(() => { location.reload(); }, 2000);
      })
      .catch(error=> {
        console.error('Error: ', error);
      })
    });

    setPronouns.addEventListener('submit', function(event){
        event.preventDefault();
        const pronouns = document.getElementById('pronouns').value;
        fetch('users/set-pronouns', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ pronouns })
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.message);
            message.textContent = data.message;
            message.classList.remove('hidden');
            setTimeout(() => { location.reload(); }, 2000);
        })
        .catch(error => {
            console.error('Error: ', error);
        });
    });
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
                alertMessage.textContent = data.error;
            } else if (data.message) {
                message.textContent = data.message;
                message.classList.remove('hidden');
                setTimeout(() => { location.reload(); }, 2000);
                
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
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alertMessage.textContent = data.error;
            } else if (data.message) {
                alertMessage.textContent = data.message;
                alertMessage.classList.remove('hidden');
                setTimeout(() => { location.reload(); }, 2000);
                
            } else {
                alert('Unexpected response from the server.');
            }
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
            message.textContent = data.message;
            message.classList.remove('hidden');
            setTimeout(() => { location.reload(); }, 2000);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });

    setAllergies.addEventListener('submit', function(event) {
        event.preventDefault();
        const checkboxes = document.querySelectorAll('.checkbox_option');
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
            message.textContent = data.message;
            message.classList.remove('hidden');
            setTimeout(() => { location.reload(); }, 2000);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });

})