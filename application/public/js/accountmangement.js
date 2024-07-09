document.addEventListener("DOMContentLoaded", function() {
    const changePasswordForm = document.getElementById('change-password-form');
    const changeUsernameForm = document.getElementById('change-username-form');
    // Allows us to change password
    changePasswordForm.addEventListener("submit", function(event){
        event.preventDefault();
        const currentPass = document.getElementById("current-password").value;
        const newPass = document.getElementById("new-password").value;
        const confirmPass = document.getElementById("verify-password").value;
        console.log("NewPass: ", newPass);
        console.log("ConfrimPass: ", confirmPass);
    
    
        fetch('/users/change-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ newPass, currentPass, confirmPass })
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

})