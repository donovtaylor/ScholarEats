document.addEventListener('DOMContentLoaded', function () {
    const registerForm = document.getElementById("register-form");
    const alertMessage = document.getElementById("alert-message");
    const message = document.getElementById("message");

    registerForm.addEventListener("submit", function(event){
        event.preventDefault();
        const email = document.getElementById('email').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const verify_password = document.getElementById('verify-password').value;
            
        fetch('/users/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, username, password, verify_password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alertMessage.textContent = data.error;
            } else {
                message.textContent = data.message;
                window.location.href = '/login';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An unexpected error occurred.');
        });
    });
});
