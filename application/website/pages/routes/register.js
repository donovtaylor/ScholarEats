document.addEventListener('DOMContentLoaded', function () {
    const registerForm = document.getElementById("register-form");
    registerForm.addEventListener("submit", function(event){
        event.preventDefault();
        const email = document.getElementById('email').value;
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const confirm_password = document.getElementById('confirm-password').value;
        //console.log("Email: ", email);
        //console.log("Username: ", username);
        //console.log("Password: ", password);
        //console.log("Confirmed-Password: ", confirm_password);  
        
        // If passwords doesn't match we alert the user.
        if(password != confirm_password){
            alert("Passwords Doesn't Match")
            return;
        }

            
        fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, username, password })
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
