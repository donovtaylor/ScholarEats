document.addEventListener('DOMContentLoaded', function () {
    const logoutButton = document.getElementById('logout-button');

    logoutButton.addEventListener("click",function(){
        fetch('/users/logout', {
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
    });
});