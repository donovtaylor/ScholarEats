document.addEventListener('DOMContentLoaded', function () {
    const registerForm = document.getElementById("register-form");
    registerForm.addEventListener("submit", function(event){
        event.preventDefault();
        const email = document.getElementById('email').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const verify_password = document.getElementById('verify-password').value;
        //console.log("Email: ", email);
        //console.log("Username: ", username);
        //console.log("Password: ", password);
        //console.log("Confirmed-Password: ", confirm_password); 
            
        fetch('/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, username, password, verify_password })
        })
        .then(response => response.text())
        .then(data => {
            alert(data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
});