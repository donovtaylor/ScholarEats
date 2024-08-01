document.addEventListener("DOMContentLoaded", function() {
    const resetPasswordForm = document.getElementById('reset-password-form');
    const message = document.getElementById("message");
    const alertMessage = document.getElementById("alert-message");

    resetPasswordForm.addEventListener("submit",function(event){
        event.preventDefault();
        const token = document.getElementById('code').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPass = document.getElementById('confirmNewPassword').value;

        fetch('/email/resetPassword', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token, newPassword, confirmNewPass })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alertMessage.textContent = data.error;
            } else {
            message.textContent = data.message;
            message.classList.remove('hidden');
            setTimeout(() => { window.location.href = '/login'; }, 2000);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    })
});