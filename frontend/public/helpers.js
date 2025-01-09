let socket;
let currentRoom = null;
let players = new Map();
let gameMode = null;
let teamScores = { red: 0, blue: 0 };
let gameModeMenu;
let gameStarted = false;

const GAME_MODES = {
    CLASSIC: 'classic',
    TEAM: 'team',
    BATTLE: 'battle',
    COOP: 'coop'
};

function initializeMultiplayer() {
    // Connect to the Socket.IO server on port 3001
    socket = io('http://localhost:3001', {
        transports: ['websocket'],
        reconnection: true
    });
    
    gameModeMenu = new GameModeMenu();
    
    setupSocketListeners();
}

function setupSocketListeners() {
    socket.on('connect', () => {
        console.log('Connected to server with ID:', socket.id);
        gameModeMenu.show();
    });
    
    socket.on('room-joined', (data) => {
        currentRoom = data.roomId;
        gameMode = data.mode;
        players.clear();
        data.players.forEach(id => {
            players.set(id, {
                ball: null,
                score: data.scores[id],
                team: data.teams?.[id]
            });
        });
        gameStarted = true;
        setupGameMode(gameMode);
    });
    
    socket.on('playerJoined', (playerId) => {
        console.log('New player joined:', playerId);
        players.set(playerId, {
            ball: null,
            score: 0
        });
    });
    
    socket.on('existingPlayers', (playerIds) => {
        console.log('Existing players:', playerIds);
        playerIds.forEach(id => {
            players.set(id, {
                ball: null,
                score: 0
            });
        });
    });
    
    socket.on('opponent-ball-update', (data) => {
        if (players.has(data.id)) {
            players.get(data.id).ball = data.ball;
        }
    });
    
    socket.on('score-update', (data) => {
        if (players.has(data.id)) {
            players.get(data.id).score = data.score;
        }
    });
    
    socket.on('player-disconnected', (playerId) => {
        console.log('Player disconnected:', playerId);
        players.delete(playerId);
    });
}

function showModeSelection() {
    const modeButtons = createModeButtons();
    modeButtons.style('position', 'absolute');
    modeButtons.style('top', '50%');
    modeButtons.style('left', '50%');
    modeButtons.style('transform', 'translate(-50%, -50%)');
}

function createModeButtons() {
    const container = createDiv();
    
    const classicBtn = createButton('Classic Mode')
        .parent(container)
        .mousePressed(() => joinRoom(GAME_MODES.CLASSIC));
    
    const teamBtn = createButton('Team Mode')
        .parent(container)
        .mousePressed(() => joinRoom(GAME_MODES.TEAM));
    
    const battleBtn = createButton('Battle Mode')
        .parent(container)
        .mousePressed(() => joinRoom(GAME_MODES.BATTLE));
    
    const coopBtn = createButton('Co-op Mode')
        .parent(container)
        .mousePressed(() => joinRoom(GAME_MODES.COOP));
    
    return container;
}

function joinRoom(mode) {
    socket.emit('join-room', mode);
}

function setupGameMode(mode) {
    switch (mode) {
        case GAME_MODES.TEAM:
            setupTeamMode();
            break;
        case GAME_MODES.BATTLE:
            setupBattleMode();
            break;
        case GAME_MODES.COOP:
            setupCoopMode();
            break;
        default:
            setupClassicMode();
    }
}

function sendBallUpdate(ball) {
    if (socket && socket.connected) {
        socket.emit('ball-update', {
            x: ball.x,
            y: ball.y,
            vx: ball.vx,
            vy: ball.vy,
            active: ball.active
        });
    }
}

function sendScoreUpdate(score) {
    if (socket && socket.connected) {
        socket.emit('score-update', score);
    }
}

function displayGameInfo() {
    push();
    textSize(24);
    textAlign(LEFT, TOP);
    fill(255);
    
    // Display mode-specific info
    switch (gameMode) {
        case GAME_MODES.TEAM:
            text(`Team Scores - Red: ${teamScores.red} Blue: ${teamScores.blue}`, 20, 20);
            break;
        case GAME_MODES.BATTLE:
            text(`Battle Mode - Power-ups Available!`, 20, 20);
            break;
        case GAME_MODES.COOP:
            text(`Co-op Mode - Combined Score: ${getTotalScore()}`, 20, 20);
            break;
        default:
            text(`Classic Mode - Score: ${score}`, 20, 20);
    }
    
    // Display players
    let yPos = 60;
    players.forEach((player, id) => {
        const isCurrentPlayer = id === socket.id;
        const teamColor = player.team ? color(player.team) : color(255);
        fill(teamColor);
        text(`${isCurrentPlayer ? 'You' : 'Player ' + id.slice(0,4)}: ${player.score}`, 20, yPos);
        yPos += 30;
    });
    pop();
}

function drawOpponentBalls() {
    push();
    fill(100, 200, 255, 200); // Blue color for opponent balls
    noStroke();
    
    players.forEach((player, id) => {
        if (player.ball && player.ball.active) {
            circle(player.ball.x, player.ball.y, 20);
        }
    });
    pop();
}

function checkCollision(ball, target) {
  // Check if ball hits target
  return (
    ball.y + ball.size/2 >= target.y &&
    ball.y - ball.size/2 <= target.y + target.height &&
    ball.x + ball.size/2 >= target.x - target.width/2 &&
    ball.x - ball.size/2 <= target.x + target.width/2
  );
}

function displayScore(score) {
  fill(255);
  textSize(32);
  textAlign(LEFT, TOP);
  text(`Score: ${score}`, 20, 20);
}

function displayDifficulty(difficulty) {
    const difficulties = ['Easy', 'Medium', 'Hard'];
    fill(255);
    textSize(24);
    textAlign(RIGHT, TOP);
    text(`Difficulty: ${difficulties[difficulty]}`, width - 20, 20);
    text('Press 1-3 to change difficulty', width - 20, 50);
}

function displayControls() {
    fill(255);
    textSize(20);
    textAlign(LEFT, BOTTOM);
    text('← → to move ball', 20, height - 20);
}

function getDifficultySpeed(difficulty) {
    const speeds = {
        0: 4,    // Easy
        1: 7,    // Medium
        2: 10    // Hard
    };
    return speeds[difficulty];
}

function spawnPowerUp() {
    // 5% chance to spawn power-up when no others exist
    if (powerUps.length === 0 && random() < 0.05) {
        const x = random(50, width - 50);
        const y = random(100, height - 100);
        powerUps.push(new PowerUp(x, y));
    }
}

function updatePowerUps(mainBall) {
    // Check collisions
    powerUps = powerUps.filter(powerUp => {
        if (powerUp.checkCollision(mainBall)) {
            activatePowerUp(powerUp, mainBall);
            return false;
        }
        return true;
    });
    
    // Draw remaining power-ups
    powerUps.forEach(powerUp => powerUp.draw());
}

function activatePowerUp(powerUp, ball) {
    // Visual feedback
    push();
    textSize(24);
    textAlign(CENTER);
    fill(255);
    text(`${powerUp.type.toUpperCase()}!`, ball.x, ball.y - 30);
    pop();
    
    // Sound feedback (if you want to add sounds later)
    
    if (powerUp.type === 'multiball') {
        // Create two clone balls
        for (let i = 0; i < 2; i++) {
            const clone = new Ball(ball.x, ball.y, ball.size, true);
            clone.active = true;
            clone.vy = ball.vy;
            clone.vx = ball.vx + random(-2, 2);
            multiBalls.push(clone);
        }
    } else {
        ball.activatePowerUp(powerUp.type);
    }
}

function updateMultiBalls() {
    // Update and draw clone balls
    multiBalls = multiBalls.filter(ball => {
        ball.update();
        ball.draw();
        return ball.y < height + 100;
    });
}

function displayPowerUpGuide() {
    push();
    textSize(16);
    textAlign(RIGHT, BOTTOM);
    fill(255);
    let y = height - 20;
    text('Power-ups:', width - 20, y);
    y -= 20;
    text('⚡ Speed Boost', width - 20, y);
    y -= 20;
    text('⭐ Size Up', width - 20, y);
    y -= 20;
    text('×2 Multi Ball', width - 20, y);
    y -= 20;
    text('↑ Low Gravity', width - 20, y);
    pop();
}

// Placeholder functions for mode-specific setups
function setupTeamMode() {}
function setupBattleMode() {}
function setupCoopMode() {}
function setupClassicMode() {}
function getTotalScore() {
    return Array.from(players.values()).reduce((total, player) => total + player.score, 0);
}