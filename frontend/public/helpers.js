let socket;
let players = new Map();

function initializeMultiplayer() {
    // Connect to the server running on port 3001
    socket = io('http://localhost:3001', {
        transports: ['websocket'],
        reconnection: true
    });
    
    socket.on('connect', () => {
        console.log('Connected to server with ID:', socket.id);
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

function displayGameStats() {
    push();
    fill(255);
    textSize(20);
    textAlign(LEFT, TOP);
    text(`Your Score: ${score}`, 20, 20);
    
    let yPos = 50;
    text('Active Players:', 20, yPos);
    
    players.forEach((player, id) => {
        yPos += 25;
        text(`Player ${id.slice(0, 4)}: ${player.score}`, 20, yPos);
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