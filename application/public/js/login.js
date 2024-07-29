document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById("login-form");
    const message = document.getElementById("message");
    const alertMessage = document.getElementById("alert-message");

    


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
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alertMessage.textContent = data.error;
            } else {
            message.textContent = "You have successfully logged in.";
            message.classList.remove('hidden');
            setTimeout(() => { window.location.href = '/'; }, 2000);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
});
