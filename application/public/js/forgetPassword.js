document.addEventListener("DOMContentLoaded", function() {
    const forgotPasswordForm = document.getElementById('forgot-password-form'); 
    const message = document.getElementById("message");
    const alertMessage = document.getElementById("alert-message");

    function generateToken(){
        token = ''
        for (i = 0; i < 6; i++){
            token += Math.floor(Math.random() * 10); 
        }
        return token;
    }

    forgotPasswordForm.addEventListener("submit",function(event){
        event.preventDefault();
        const email = document.getElementById('email').value;
        const token = generateToken();
    
        fetch('/email/forgotpassword', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, token })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alertMessage.textContent = data.error;
                setTimeout(() => { location.reload(); }, 2000);
    
            } else {
            message.textContent = data.message;
            message.classList.remove('hidden');
            setTimeout(() => { window.location.href = '/resetPassword'; }, 2000);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
});