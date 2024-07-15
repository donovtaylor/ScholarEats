document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById("login-form");
    


    loginForm.addEventListener("submit",function(event){
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        fetch('/users/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
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
/*    
    // Allows us to change password
    changePasswordForm.addEventListener("submit", function(event){
        event.preventDefault();
        const currentPass = document.getElementById("current-pass").value;
        const newPass = document.getElementById("new-pass").value;
        const confirmPass = document.getElementById("confirm-pass").value;
        //console.log("NewPass: ", newPass);
        //console.log("ConfrimPass: ", confirmPass);
    
    
        fetch('/change-password', {
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

        fetch('/change-username', {
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
    */

});
