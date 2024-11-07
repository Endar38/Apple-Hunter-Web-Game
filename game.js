// game.js
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Variabel game
let players = [
    { 
        name: '', 
        x: 100, 
        y: canvas.height - 60, 
        width: 40, 
        height: 40, 
        score: 0, 
        color: 'blue', 
        keys: { left: 'a', right: 'd', up: 'w', down: 's', kick: 'q' },
        isKnocked: false,
        knockbackVelocity: { x: 0, y: 0 },
        canKick: true,
        kickCooldown: 0,
        originalColor: 'blue',
        // Properti Animasi
        animation: {
            state: 'idle', // 'idle', 'run', 'kick', 'knocked'
            frameIndex: 0,
            frameTimer: 0,
            frameInterval: 100, // milidetik per frame
            sprites: {
                idle: {
                    image: new Image(),
                    frameCount: 4, // Sesuaikan jumlah frame
                    frameWidth: 150, // Sesuaikan lebar frame
                    frameHeight: 150, // Sesuaikan tinggi frame
                    loop: true
                },
                run: {
                    image: new Image(),
                    frameCount: 8,
                    frameWidth: 150,
                    frameHeight: 150,
                    loop: true
                },
                kick: {
                    image: new Image(),
                    frameCount: 8,
                    frameWidth: 150,
                    frameHeight: 150,
                    loop: false
                },
                knocked: {
                    image: new Image(),
                    frameCount: 4,
                    frameWidth: 150,
                    frameHeight: 150,
                    loop: false
                }
            }
        }
    },
    { 
        name: '', 
        x: 650, 
        y: canvas.height - 60, 
        width: 40, 
        height: 40, 
        score: 0, 
        color: 'red', 
        keys: { left: 'j', right: 'l', up: 'i', down: 'k', kick: 'o' },
        isKnocked: false,
        knockbackVelocity: { x: 0, y: 0 },
        canKick: true,
        kickCooldown: 0,
        originalColor: 'red',
        // Properti Animasi
        animation: {
            state: 'idle', // 'idle', 'run', 'kick', 'knocked'
            frameIndex: 0,
            frameTimer: 0,
            frameInterval: 100, // milidetik per frame
            sprites: {
                idle: {
                    image: new Image(),
                    frameCount: 4, // Sesuaikan jumlah frame
                    frameWidth: 150, // Sesuaikan lebar frame
                    frameHeight: 150, // Sesuaikan tinggi frame
                    loop: true
                },
                run: {
                    image: new Image(),
                    frameCount: 4,
                    frameWidth: 150,
                    frameHeight: 150,
                    loop: true
                },
                kick: {
                    image: new Image(),
                    frameCount: 8,
                    frameWidth: 150,
                    frameHeight: 150,
                    loop: false
                },
                knocked: {
                    image: new Image(),
                    frameCount: 4,
                    frameWidth: 150,
                    frameHeight: 150,
                    loop: false
                }
            }
        }
    }
];
let objects = []; // Apel dan perangkap
let spawnInterval;
let gameDuration = 60; // detik
let timeRemaining = gameDuration;
let gameInterval;
let gameTimer;
let keysPressed = {};
let gameStarted = false;

// Indikator untuk titik spawn
let spawnIndicators = [];
const spawnIndicatorDuration = 1000; // milidetik

// Preload gambar sprite
let appleImage = new Image();
let trapImage = new Image();

function preloadSprites() {
    players.forEach((player, index) => {
        const states = ['idle', 'run', 'kick', 'knocked'];
        states.forEach(state => {
            // Nama file sprite sesuai dengan pemain dan state
            player.animation.sprites[state].image.src = `assets/${state}${index + 1}.png`;
        });
    });

    // Memuat sprite untuk apel dan perangkap
    appleImage.src = 'assets/apple.png';
    trapImage.src = 'assets/trap.png';
}

// Menyimpan status tombol untuk hover
let hoveredButton = null;

// Definisikan area tombol di dalam kanvas
const buttons = [
    {
        name: 'logout',
        x: canvas.width - 140,
        y: 20,
        width: 120,
        height: 40,
        text: 'Logout'
    },
    /*
    {
        name: 'leaderboard',
        x: 10,
        y: 100,
        width: 180,
        height: 40,
        text: 'View Leaderboard'
    }*/
];

// Memuat nama pemain dari localStorage
document.addEventListener('DOMContentLoaded', () => {
    const p1 = localStorage.getItem('player1');
    const p2 = localStorage.getItem('player2');
    if (!p1 || !p2) {
        // Redirect ke login jika nama pemain tidak tersedia
        window.location.href = 'login.html';
        return;
    }
    players[0].name = p1;
    players[1].name = p2;

    // Memuat skor dan waktu
    players[0].score = parseInt(localStorage.getItem('score1')) || 0;
    players[1].score = parseInt(localStorage.getItem('score2')) || 0;
    timeRemaining = parseInt(localStorage.getItem('timeRemaining')) || gameDuration;

    preloadSprites(); // Mulai memuat sprite

    // Pastikan semua sprite telah dimuat sebelum memulai game
    let loadedSprites = 0;
    const totalSprites = players.length * 4 + 2; // 4 state per pemain + apel & perangkap

    players.forEach((player, index) => {
        const states = ['idle', 'run', 'kick', 'knocked'];
        states.forEach(state => {
            player.animation.sprites[state].image.onload = () => {
                loadedSprites++;
                if (loadedSprites === totalSprites) {
                    startGame();
                }
            };
            player.animation.sprites[state].image.onerror = () => {
                console.error(`Gagal memuat sprite: ${state}${index + 1}.png`);
                loadedSprites++;
                if (loadedSprites === totalSprites) {
                    startGame();
                }
            };
        });
    });

    // Loader untuk apel dan perangkap
    appleImage.onload = () => {
        loadedSprites++;
        if (loadedSprites === totalSprites) {
            startGame();
        }
    };
    appleImage.onerror = () => {
        console.error('Gagal memuat sprite: apple.png');
        loadedSprites++;
        if (loadedSprites === totalSprites) {
            startGame();
        }
    };

    trapImage.onload = () => {
        loadedSprites++;
        if (loadedSprites === totalSprites) {
            startGame();
        }
    };
    trapImage.onerror = () => {
        console.error('Gagal memuat sprite: trap.png');
        loadedSprites++;
        if (loadedSprites === totalSprites) {
            startGame();
        }
    };
});

// Menangani input keyboard
document.addEventListener('keydown', function(e) {
    const key = e.key.toLowerCase();
    keysPressed[key] = true;

    // Menangani aksi kick
    players.forEach((player, index) => {
        if (key === player.keys.kick && player.canKick && !player.isKnocked) {
            performKick(index);
        }
    });
});

document.addEventListener('keyup', function(e) {
    const key = e.key.toLowerCase();
    keysPressed[key] = false;
});

// Menangani klik pada kanvas untuk tombol
canvas.addEventListener('click', function(event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    buttons.forEach(button => {
        if (
            mouseX >= button.x &&
            mouseX <= button.x + button.width &&
            mouseY >= button.y &&
            mouseY <= button.y + button.height
        ) {
            handleButtonClick(button.name);
        }
    });
});

// Menangani gerakan mouse untuk efek hover pada tombol
canvas.addEventListener('mousemove', function(event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    let isHovering = false;

    buttons.forEach(button => {
        if (
            mouseX >= button.x &&
            mouseX <= button.x + button.width &&
            mouseY >= button.y &&
            mouseY <= button.y + button.height
        ) {
            hoveredButton = button.name;
            isHovering = true;
        }
    });

    if (!isHovering) {
        hoveredButton = null;
    }
});

// Memulai permainan
function startGame() {
    // Inisialisasi skor dan waktu
    players.forEach(p => {
        p.score = 0;
        p.isKnocked = false;
        p.knockbackVelocity = { x: 0, y: 0 };
        p.canKick = true;
        p.kickCooldown = 0;
        p.color = p.originalColor;
        // Inisialisasi animasi
        p.animation.state = 'idle';
        p.animation.frameIndex = 0;
        p.animation.frameTimer = 0;
    });
    timeRemaining = gameDuration;
    localStorage.setItem('score1', 0);
    localStorage.setItem('score2', 0);
    localStorage.setItem('timeRemaining', timeRemaining);

    // Bersihkan objek dan indikator spawn
    objects = [];
    spawnIndicators = [];

    // Mulai spawn objek
    clearInterval(spawnInterval);
    spawnInterval = setInterval(spawnObject, 2000); // spawn setiap 2 detik

    // Mulai game loop
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, 1000 / 60);

    // Mulai timer
    clearInterval(gameTimer);
    gameTimer = setInterval(() => {
        timeRemaining--;
        if (timeRemaining < 0) timeRemaining = 0;
        if (gameStarted) {
            // Menyimpan waktu yang tersisa di localStorage
            localStorage.setItem('timeRemaining', timeRemaining);
        }
        if (timeRemaining <= 0) {
            clearInterval(gameTimer);
            endGame();
        }
    }, 1000);

    gameStarted = true;
}

// Spawn apel atau perangkap dengan indikator
function spawnObject() {
    const x = Math.random() * (canvas.width - 60) + 30; // Menyesuaikan agar sprite tidak keluar
    const y = -30;
    const speed = 2 + Math.random() * 3;
    const type = Math.random() < 0.8 ? 'apple' : 'trap'; // 80% apel

    // Tambahkan spawn indicator
    spawnIndicators.push({ x, y: 20, timestamp: Date.now(), type });

    // Delay spawn aktual dengan durasi indikator
    setTimeout(() => {
        // Tambahkan properti gambar ke objek
        const objImage = type === 'apple' ? appleImage : trapImage;
        objects.push({ x, y, speed, type, image: objImage });
    }, spawnIndicatorDuration);
}

// Game loop
function gameLoop() {
    update();
    draw();
}

// Memperbarui state game
function update() {
    // Memperbarui posisi pemain dan menangani cooldown kick
    players.forEach((player, index) => {
        const wasMoving = isPlayerMoving(player);

        // Gerakan
        if (!player.isKnocked) { // Izinkan gerakan hanya jika tidak terkena knockback
            if (keysPressed[player.keys.left]) {
                player.x -= 5;
            }
            if (keysPressed[player.keys.right]) {
                player.x += 5;
            }
            if (keysPressed[player.keys.up]) {
                player.y -= 5;
            }
            if (keysPressed[player.keys.down]) {
                player.y += 5;
            }
        }

        // Batas canvas
        if (player.x < 0 - player.width * 1.5) player.x = 0 - player.width * 1.5;
        if (player.x + player.width  > canvas.width - player.width * 1.5 ) player.x = canvas.width - player.width*2.5;
        if (player.y < 0 - player.height * 1.5) player.y = 0 - player.height * 1.5;
        if (player.y + player.height > canvas.height - player.height * 1.5) player.y = canvas.height - player.height * 2.5;

        // Menangani knockback
        if (player.isKnocked) {
            player.x += player.knockbackVelocity.x;
            player.y += player.knockbackVelocity.y;

            // Friksi
            player.knockbackVelocity.x *= 0.9;
            player.knockbackVelocity.y *= 0.9;

            // Hentikan knockback jika kecepatan sangat rendah
            if (Math.abs(player.knockbackVelocity.x) < 0.1 && Math.abs(player.knockbackVelocity.y) < 0.1) {
                player.knockbackVelocity.x = 0;
                player.knockbackVelocity.y = 0;
                player.isKnocked = false;
                player.color = player.originalColor; // Kembalikan warna asli
                changePlayerState(player, 'idle');
            }

            // Pastikan pemain tetap dalam batas canvas
            if (player.x < 0) player.x = 0;
            if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
            if (player.y < 0) player.y = 0;
            if (player.y + player.height > canvas.height) player.y = canvas.height - player.height;
        }

        // Menangani cooldown kick
        if (!player.canKick) {
            player.kickCooldown--;
            if (player.kickCooldown <= 0) {
                player.canKick = true;
            }
        }

        // Memperbarui state animasi berdasarkan gerakan dan aksi
        if (!player.isKnocked) {
            if (player.animation.state !== 'kick') { // Jangan override state kick
                if (wasMoving) {
                    changePlayerState(player, 'run');
                } else {
                    changePlayerState(player, 'idle');
                }
            }
        }

        // Memperbarui frame animasi pemain
        updatePlayerAnimation(player);
    });

    // Menangani tabrakan antar pemain
    handlePlayerCollisions();

    // Memperbarui posisi objek
    objects.forEach(obj => {
        obj.y += obj.speed;
    });

    // Mengecek tabrakan dengan objek
    for (let i = objects.length - 1; i >= 0; i--) {
        const obj = objects[i];
        players.forEach(player => {
            if (isColliding(player, obj)) {
                if (obj.type === 'apple') {
                    player.score += 1;
                } else {
                    player.score = Math.max(0, player.score - 1);
                }
                updateScores();
                objects.splice(i, 1); // Hapus objek setelah ditangkap
            }
        });
        // Hapus objek yang keluar layar
        if (obj.y > canvas.height) {
            objects.splice(i, 1);
        }
    }

    // Memperbarui spawn indicators
    spawnIndicators = spawnIndicators.filter(indicator => {
        return Date.now() - indicator.timestamp < spawnIndicatorDuration;
    });
}

// Memeriksa apakah pemain sedang bergerak
function isPlayerMoving(player) {
    return keysPressed[player.keys.left] || keysPressed[player.keys.right] ||
           keysPressed[player.keys.up] || keysPressed[player.keys.down];
}

// Mengubah state animasi pemain
function changePlayerState(player, newState) {
    if (player.animation.state !== newState) {
        player.animation.state = newState;
        player.animation.frameIndex = 0;
        player.animation.frameTimer = 0;
    }
}

// Memperbarui frame animasi pemain
function updatePlayerAnimation(player) {
    const anim = player.animation;
    const currentState = anim.state;
    const sprite = anim.sprites[currentState];

    anim.frameTimer += 1000 / 60; // Asumsi gameLoop berjalan pada 60 FPS (~16.67ms per frame)
    if (anim.frameTimer >= anim.frameInterval) {
        anim.frameTimer = 0;
        anim.frameIndex++;
        if (anim.frameIndex >= sprite.frameCount) {
            if (sprite.loop) {
                anim.frameIndex = 0;
            } else {
                anim.frameIndex = sprite.frameCount - 1; // Tetap pada frame terakhir
                // Jika animasi tidak loop, kembali ke idle setelah selesai
                if (currentState === 'kick' || currentState === 'knocked') {
                    changePlayerState(player, 'idle');
                }
            }
        }
    }
}

// Menangani tabrakan antar pemain dan menerapkan mekanik push
function handlePlayerCollisions() {
    const player1 = players[0];
    const player2 = players[1];

    if (isRectColliding(player1, player2)) {
        // Menentukan apakah masing-masing pemain bergerak menuju pemain lain
        const movingTowards = getMovementTowards(player1, player2);

        if (movingTowards.player1 && !movingTowards.player2) {
            applyPush(player1, player2);
        } else if (!movingTowards.player1 && movingTowards.player2) {
            applyPush(player2, player1);
        } else if (movingTowards.player1 && movingTowards.player2) {
            // Kedua pemain saling mendorong, resolve overlap
            resolveOverlap(player1, player2);
        }
    }
}

// Memeriksa apakah dua rectangle bertabrakan
function isRectColliding(p1, p2) {
    return p1.x < p2.x + p2.width &&
           p1.x + p1.width > p2.x &&
           p1.y < p2.y + p2.height &&
           p1.y + p1.height > p2.y;
}

// Menentukan apakah pemain bergerak menuju pemain lain
function getMovementTowards(p1, p2) {
    const threshold = 1; // Minimum movement untuk dianggap bergerak

    const p1MovingRight = keysPressed[p1.keys.right];
    const p1MovingLeft = keysPressed[p1.keys.left];
    const p1MovingUp = keysPressed[p1.keys.up];
    const p1MovingDown = keysPressed[p1.keys.down];

    const p2MovingRight = keysPressed[p2.keys.right];
    const p2MovingLeft = keysPressed[p2.keys.left];
    const p2MovingUp = keysPressed[p2.keys.up];
    const p2MovingDown = keysPressed[p2.keys.down];

    let player1TowardsPlayer2 = false;
    let player2TowardsPlayer1 = false;

    // Gerakan horizontal
    if (p1MovingRight && p1.x < p2.x) {
        player1TowardsPlayer2 = true;
    }
    if (p1MovingLeft && p1.x > p2.x) {
        player1TowardsPlayer2 = true;
    }

    if (p2MovingRight && p2.x < p1.x) {
        player2TowardsPlayer1 = true;
    }
    if (p2MovingLeft && p2.x > p1.x) {
        player2TowardsPlayer1 = true;
    }

    // Gerakan vertikal
    if (p1MovingDown && p1.y < p2.y) {
        player1TowardsPlayer2 = true;
    }
    if (p1MovingUp && p1.y > p2.y) {
        player1TowardsPlayer2 = true;
    }

    if (p2MovingDown && p2.y < p1.y) {
        player2TowardsPlayer1 = true;
    }
    if (p2MovingUp && p2.y > p1.y) {
        player2TowardsPlayer1 = true;
    }

    return {
        player1: player1TowardsPlayer2,
        player2: player2TowardsPlayer1
    };
}

// Menerapkan push dari pendorong ke yang didorong
function applyPush(pusher, pushee) {
    const pushStrength = 5;

    // Menentukan arah dari pendorong ke yang didorong
    const centerPusher = { x: pusher.x + pusher.width / 2, y: pusher.y + pusher.height / 2 };
    const centerPushee = { x: pushee.x + pushee.width / 2, y: pushee.y + pushee.height / 2 };

    const dx = centerPushee.x - centerPusher.x;
    const dy = centerPushee.y - centerPusher.y;
    const distance = Math.hypot(dx, dy);

    if (distance === 0) return; // Menghindari pembagian dengan nol

    const forceX = (dx / distance) * pushStrength;
    const forceY = (dy / distance) * pushStrength;

    // Menerapkan gaya ke pushee
    pushee.x += forceX;
    pushee.y += forceY;

    // Resolusi overlap
    resolveOverlap(pusher, pushee);
}

// Resolusi overlapping dengan memindahkan pemain agar tidak tumpang tindih
function resolveOverlap(p1, p2) {
    const overlapX = Math.min(p1.x + p1.width - p2.x, p2.x + p2.width - p1.x);
    const overlapY = Math.min(p1.y + p1.height - p2.y, p2.y + p2.height - p1.y);

    if (overlapX < overlapY) {
        if (p1.x < p2.x) {
            p1.x -= overlapX / 2;
            p2.x += overlapX / 2;
        } else {
            p1.x += overlapX / 2;
            p2.x -= overlapX / 2;
        }
    } else {
        if (p1.y < p2.y) {
            p1.y -= overlapY / 2;
            p2.y += overlapY / 2;
        } else {
            p1.y += overlapY / 2;
            p2.y -= overlapY / 2;
        }
    }

    // Pastikan pemain tetap dalam batas canvas
    if (p1.x < 0) p1.x = 0;
    if (p1.x + p1.width > canvas.width) p1.x = canvas.width - p1.width;
    if (p1.y < 0) p1.y = 0;
    if (p1.y + p1.height > canvas.height) p1.y = canvas.height - p1.height;

    if (p2.x < 0) p2.x = 0;
    if (p2.x + p2.width > canvas.width) p2.x = canvas.width - p2.width;
    if (p2.y < 0) p2.y = 0;
    if (p2.y + p2.height > canvas.height) p2.y = canvas.height - p2.height;
}

// Memeriksa tabrakan antara pemain dan objek
function isColliding(player, obj) {
    if (obj.type === 'apple') {
        // Tabrakan lingkaran untuk apel
        const dist = Math.hypot(obj.x - (player.x + player.width * 2), obj.y - (player.y + player.height * 2));
        return dist < 15 + Math.max(player.width / 2, player.height / 2);
    } else {
        // Tabrakan kotak untuk perangkap
        return obj.x < player.x + player.width * 2.5 &&
               obj.x + 30 > player.x + player.width * 2 &&
               obj.y < player.y + player.height * 2.5 &&
               obj.y + 30 > player.y + player.width * 2;
    }
}

// Memperbarui tampilan skor
function updateScores() {
    // Simpan skor ke localStorage
    localStorage.setItem('score1', players[0].score);
    localStorage.setItem('score2', players[1].score);
}

// Melakukan aksi kick
function performKick(kickerIndex) {
    const kicker = players[kickerIndex];
    const targetIndex = kickerIndex === 0 ? 1 : 0;
    const target = players[targetIndex];

    // Mendefinisikan jarak maksimum untuk dapat menendang
    const maxKickDistance = 60;

    // Menghitung jarak antara kedua pemain
    const dx = (target.x + target.width / 2) - (kicker.x + kicker.width / 2);
    const dy = (target.y + target.height / 2) - (kicker.y + kicker.height / 2);
    const distance = Math.hypot(dx, dy);

    if (distance <= maxKickDistance) {
        // Menentukan arah knockback (menendang ke arah yang berlawanan)
        const angle = Math.atan2(dy, dx);
        const knockbackStrength = 15; // Kecepatan knockback

        // Menambahkan knockback ke target
        target.knockbackVelocity.x += Math.cos(angle) * knockbackStrength;
        target.knockbackVelocity.y += Math.sin(angle) * knockbackStrength;
        target.isKnocked = true;
        target.color = 'yellow'; // Warna sementara saat terkena tendangan

        // Mengubah state animasi target menjadi 'knocked'
        changePlayerState(target, 'knocked');

        // Mengatur cooldown untuk kicker
        kicker.canKick = false;
        kicker.kickCooldown = 60; // 1 detik jika game loop 60 FPS

        // Mengubah state animasi kicker menjadi 'kick'
        changePlayerState(kicker, 'kick');
    }
}

// Menggambar spawn indicators
function drawSpawnIndicators() {
    spawnIndicators.forEach(indicator => {
        // Gambar indikator sebagai lingkaran kecil dengan warna berdasarkan tipe
        if (indicator.type === 'apple') {
            ctx.fillStyle = 'green';
        } else {
            ctx.fillStyle = 'black';
        }
        ctx.beginPath();
        ctx.arc(indicator.x, indicator.y, 10, 0, Math.PI * 2);
        ctx.fill();
    });
}

// Menggambar semua elemen
function draw() {
    // Bersihkan canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Gambar spawn indicators
    drawSpawnIndicators();

    // Gambar pemain dengan animasi
    players.forEach(player => {
        const anim = player.animation;
        const currentState = anim.state;
        const sprite = anim.sprites[currentState];

        // Hitung posisi sumber di sprite sheet
        const sx = anim.frameIndex * sprite.frameWidth;
        const sy = 0; // Asumsikan semua frame berada dalam satu baris

        // Gambar frame saat ini
        ctx.drawImage(
            sprite.image,
            sx, sy,
            sprite.frameWidth, sprite.frameHeight,
            player.x, player.y,
            sprite.frameWidth, sprite.frameHeight
        );
    });

    // Gambar objek menggunakan sprite
    objects.forEach(obj => {
        if (obj.image.complete) { // Pastikan gambar sudah dimuat
            ctx.drawImage(
                obj.image,
                obj.x - 15, // Menyesuaikan posisi agar sprite berada di tengah
                obj.y - 15,
                30, // Lebar sprite
                30  // Tinggi sprite
            );
        } else {
            // Jika gambar belum dimuat, fallback ke gambar dasar
            if (obj.type === 'apple') {
                // Gambar apel sebagai lingkaran hijau dengan batang coklat
                ctx.fillStyle = 'yellow';
                ctx.beginPath();
                ctx.arc(obj.x, obj.y, 15, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = 'brown';
                ctx.fillRect(obj.x - 3, obj.y - 15, 6, 10);
            } else {
                // Gambar perangkap sebagai kotak hitam
                ctx.fillStyle = 'yellow';
                ctx.beginPath();
                ctx.rect(obj.x - 15, obj.y - 15, 30, 30);
                ctx.fill();
            }
        }
    });

    // Gambar instruksi kontrol
    drawControlsInstructions();

    // Gambar skor dan waktu
    drawScoresAndTime();

    // Gambar tombol
    drawButtons();
}

// Fungsi untuk menggambar instruksi kontrol
function drawControlsInstructions() {
    ctx.font = "16px Arial";
    ctx.fillStyle = "black";
    ctx.fillText("Player 1: W/A/S/D to move, Q to attack", 150, 30);
    ctx.fillText("Player 2: I/J/K/L to move, O to attack", 150, 50);
}

// Fungsi untuk menggambar skor dan waktu
function drawScoresAndTime() {
    ctx.font = "20px Arial";
    ctx.fillStyle = "black";
    ctx.fillText(`${players[0].name}: ${players[0].score}`, canvas.width/2, 30);
    ctx.fillText(`${players[1].name}: ${players[1].score}`, canvas.width/2, 60);
    ctx.fillText(`Time: ${timeRemaining}`, canvas.width - 225, 30);
}

// Fungsi untuk menggambar tombol dengan efek hover
function drawButtons() {
    buttons.forEach(button => {
        // Gambar kotak tombol dengan warna berbeda jika di-hover
        if (hoveredButton === button.name) {
            ctx.fillStyle = '#555';
        } else {
            ctx.fillStyle = '#333';
        }
        ctx.fillRect(button.x, button.y, button.width, button.height);
        
        // Gambar teks tombol
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(button.text, button.x + button.width / 2, button.y + button.height / 2);
    });
}

// Mengakhiri permainan
function endGame() {
    clearInterval(spawnInterval);
    clearInterval(gameInterval);
    clearInterval(gameTimer);
    gameStarted = false;

    // Simpan skor ke localStorage
    localStorage.setItem('score1', players[0].score);
    localStorage.setItem('score2', players[1].score);

    // Update leaderboard
    updateLeaderboard();

    alert('Waktu Habis! Permainan Selesai.');

    // Reset waktu
    timeRemaining = gameDuration;
    localStorage.setItem('timeRemaining', timeRemaining);

    // Redirect ke leaderboard
    window.location.href = 'leaderboard.html';
}

// Fungsi leaderboard
function updateLeaderboard() {
    // Ambil leaderboard yang ada
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
    // Tambahkan skor saat ini
    leaderboard.push({ 
        player1: players[0].name, 
        score1: players[0].score, 
        player2: players[1].name, 
        score2: players[1].score 
    });
    // Sort leaderboard berdasarkan skor gabungan
    leaderboard.sort((a, b) => (b.score1 + b.score2) - (a.score1 + a.score2));
    // Simpan top 10
    leaderboard = leaderboard.slice(0, 10);
    // Simpan kembali ke localStorage
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
}

// Fungsi untuk menangani klik tombol
function handleButtonClick(buttonName) {
    if (buttonName === 'logout') {
        // Hapus data permainan
        localStorage.removeItem('player1');
        localStorage.removeItem('player2');
        localStorage.removeItem('score1');
        localStorage.removeItem('score2');
        localStorage.removeItem('timeRemaining');
        // Redirect ke login
        window.location.href = 'login.html';
    } else if (buttonName === 'leaderboard') {
        // Redirect ke leaderboard
        window.location.href = 'leaderboard.html';
    }
}
