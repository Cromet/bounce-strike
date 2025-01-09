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