// leaderboard.js
document.addEventListener('DOMContentLoaded', () => {
    displayLeaderboard();

    const backToLoginBtn = document.getElementById('back-to-login');
    const startNewGameBtn = document.getElementById('start-new-game');
    const resetDataBtn = document.getElementById('reset-data'); // Tambahkan tombol reset

    backToLoginBtn.addEventListener('click', () => {
        window.location.href = 'login.html';
    });

    startNewGameBtn.addEventListener('click', () => {
        // Periksa apakah pemain sudah login
        const p1 = localStorage.getItem('player1');
        const p2 = localStorage.getItem('player2');
        if (p1 && p2) {
            window.location.href = 'game.html';
        } else {
            alert('Silakan login terlebih dahulu.');
            window.location.href = 'login.html';
        }
    });

    resetDataBtn.addEventListener('click', () => {
        if (confirm('Apakah Anda yakin ingin mereset semua data permainan? Ini akan menghapus semua skor dan nama pemain.')) {
            resetGameData();
            displayLeaderboard();
            alert('Semua data permainan telah direset.');
        }
    });
});

// Tampilkan leaderboard
function displayLeaderboard() {
    const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    const leaderboardEl = document.getElementById('leaderboard');
    leaderboardEl.innerHTML = '';
    if (leaderboard.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'Tidak ada skor tersedia.';
        leaderboardEl.appendChild(li);
    } else {
        leaderboard.forEach((entry, index) => {
            const li = document.createElement('li');
            li.textContent = `${index + 1}. ${entry.player1} (${entry.score1}) vs ${entry.player2} (${entry.score2})`;
            leaderboardEl.appendChild(li);
        });
    }
}

// Fungsi untuk mereset semua data permainan
function resetGameData() {
    // Hapus semua item yang terkait dengan permainan dari localStorage
    localStorage.removeItem('player1');
    localStorage.removeItem('player2');
    localStorage.removeItem('score1');
    localStorage.removeItem('score2');
    localStorage.removeItem('timeRemaining');
    localStorage.removeItem('leaderboard');
}
