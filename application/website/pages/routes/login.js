document.addEventListener('DOMContentLoaded', function () {
    const loginForm = document.getElementById("login-form");
    const logoutButton = document.getElementById('logout-button');
    const status = document.getElementById('status');

    // This is to display the info such as the email and the username in the login
    fetch('/status', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.loggedIn) {
            status.textContent = `You're logged in as ${data.user.username} with the email ${data.user.email}`;
        } else {
            status.textContent = `You're not logged in`;
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });

    loginForm.addEventListener("submit",function(event){
        event.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        console.log("Email: ", email);
        console.log("Password: ", password);
        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        })
        .then(response => response.text())
        .then(data => {
            alert(data);
        })
        .catch(error => {
            console.error('Error:', error);
        });
        location.reload();
    });

    logoutButton.addEventListener("click",function(){
        fetch('/logout', {
            method: 'POST'
        })
        .then(response => response.json())
        .then(data => {
            alert(data.message);
            location.reload();
        })
        .catch(error => {
            console.error('Error:', error);
        });
    })
});