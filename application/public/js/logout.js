document.addEventListener('DOMContentLoaded', function () {
    const logoutButton = document.getElementById('logout-button');
    const logoutMessage = document.getElementById('message');

    logoutButton.addEventListener("click",function(){
        fetch('/users/logout', {
            method: 'POST'
        })
        .then(response => response.text())
        .then(data => {
            logoutMessage.textContent = "You have successfully logged out.";
            logoutMessage.classList.remove('hidden');
            setTimeout(() => { window.location.href = '/'; }, 2000);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
});