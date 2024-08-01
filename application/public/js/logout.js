document.addEventListener('DOMContentLoaded', function () {
    const logoutButton = document.getElementById('logout-button');

    logoutButton.addEventListener("click",function(){
        fetch('/users/logout', {
            method: 'POST'
        })
        .then(response => response.text())
        .then(data => {
            
            setTimeout(() => { window.location.href = '/'; }, 2000);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
});