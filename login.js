// login.js
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const viewLeaderboardBtn = document.getElementById('view-leaderboard');

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const p1 = document.getElementById('player1-name').value.trim();
        const p2 = document.getElementById('player2-name').value.trim();
        if (p1 && p2) {
            // Simpan nama pemain di localStorage
            localStorage.setItem('player1', p1);
            localStorage.setItem('player2', p2);
            // Reset skor dan waktu
            localStorage.setItem('score1', 0);
            localStorage.setItem('score2', 0);
            localStorage.setItem('timeRemaining', 60);
            // Redirect ke halaman game
            window.location.href = 'game.html';
        }
    });

    viewLeaderboardBtn.addEventListener('click', () => {
        window.location.href = 'leaderboard.html';
    });
});
