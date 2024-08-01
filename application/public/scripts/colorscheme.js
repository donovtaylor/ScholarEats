document.addEventListener('DOMContentLoaded', () => {
    fetch('/users/get-modes')
        .then(response => response.json())
        .then(data => {
            const modes = data.modes === 1 ? 'darkmode' : 'default';
            document.body.className = modes;
        });


    document.getElementById('modeSelect').addEventListener('change', () => {
        const currentMode = document.body.className;
        const updatedMode = currentMode === 'default' ? 'darkmode' : 'default';
        document.body.className = updatedMode;

        fetch('/users/set-modes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: userId, modes: updateMode }),
        });
    });
});