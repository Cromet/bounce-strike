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

let socket;
let playerId;
let opponents = new Map();
let leaderboard = [];
let playerName = '';

let powerUps = [];
let multiBalls = [];

function initializeMultiplayer() {
    socket = io('http://localhost:3001');
    
    socket.on('connect', () => {
        playerId = socket.id;
    });
    
    socket.on('players-update', (players) => {
        players.forEach(player => {
            if (player.id !== playerId) {
                opponents.set(player.id, player);
            }
        });
    });
    
    socket.on('opponent-ball-update', (data) => {
        if (data.id !== playerId) {
            opponents.set(data.id, {
                ...opponents.get(data.id),
                ball: data.ball
            });
        }
    });
    
    socket.on('player-disconnected', (id) => {
        opponents.delete(id);
    });
    
    // Add leaderboard handler
    socket.on('leaderboard-update', (newLeaderboard) => {
        leaderboard = newLeaderboard;
    });
    
    // Prompt for player name
    playerName = prompt('Enter your name:', `Player ${Math.floor(Math.random() * 1000)}`);
    socket.emit('name-update', playerName);
}

function sendBallUpdate(ball) {
    if (socket && ball.active) {
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
    if (socket) {
        socket.emit('score-update', score);
    }
}

function drawOpponentBalls() {
    push();
    fill(100, 200, 255, 200); // Blue-ish color for opponent balls
    opponents.forEach(opponent => {
        if (opponent.ball && opponent.ball.active) {
            circle(opponent.ball.x, opponent.ball.y, 20);
        }
    });
    pop();
}

function displayScoreboard() {
    push();
    fill(255);
    textSize(20);
    textAlign(RIGHT, TOP);
    
    let yPos = 80;
    text(`Your Score: ${score}`, width - 20, yPos);
    
    opponents.forEach((opponent, id) => {
        yPos += 25;
        text(`Player ${id.slice(0, 4)}: ${opponent.score}`, width - 20, yPos);
    });
    pop();
}

function drawLeaderboard() {
    const padding = 20;
    const entryHeight = 30;
    const boardWidth = 300;
    const startX = width - boardWidth - padding;
    const startY = 120;
    
    // Draw background
    push();
    fill(0, 0, 0, 200);
    rect(startX, startY, boardWidth, entryHeight * (leaderboard.length + 1));
    
    // Draw title
    fill(255, 215, 0); // Gold color
    textSize(24);
    textAlign(CENTER, TOP);
    text('LEADERBOARD', startX + boardWidth/2, startY);
    
    // Draw entries
    textSize(16);
    textAlign(LEFT, TOP);
    leaderboard.forEach((entry, index) => {
        const y = startY + entryHeight * (index + 1);
        const isCurrentPlayer = entry.id === socket.id;
        
        // Highlight current player
        if (isCurrentPlayer) {
            fill(255, 255, 0, 50);
            rect(startX, y, boardWidth, entryHeight);
        }
        
        // Draw rank
        fill(isCurrentPlayer ? 255, 255, 0 : 255);
        text(`${index + 1}.`, startX + 10, y + 5);
        
        // Draw name (use stored name for current player)
        const displayName = isCurrentPlayer ? playerName : `Player ${entry.id.slice(0, 4)}`;
        text(displayName, startX + 50, y + 5);
        
        // Draw score
        textAlign(RIGHT, TOP);
        text(entry.score, startX + boardWidth - 10, y + 5);
        textAlign(LEFT, TOP);
    });
    pop();
}

function displayGameStats() {
    push();
    fill(255);
    textSize(20);
    textAlign(LEFT, TOP);
    text(`Current Score: ${score}`, 20, 20);
    
    // Display active players
    let yPos = 50;
    text('Active Players:', 20, yPos);
    yPos += 25;
    
    text(`You (${playerName}): ${score}`, 20, yPos);
    opponents.forEach((opponent, id) => {
        yPos += 25;
        text(`${opponent.name}: ${opponent.score}`, 20, yPos);
    });
    pop();
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