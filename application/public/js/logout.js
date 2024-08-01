document.addEventListener('DOMContentLoaded', function () {
    const logoutButton = document.getElementById('logout-button');

    logoutButton.addEventListener("click",function(){
        fetch('/users/logout', {
            method: 'POST'
        })
        .then(response => response.text())
        .then(data => {
            window.location.href = '/';
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
});