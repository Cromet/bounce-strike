let ball;
let target;
let score = 0;
let canDrop = true;
let gameStarted = false;
let gameMode;
const GAME_MODES = {
    CLASSIC: 'classic',
    TEAM: 'team',
    BATTLE: 'battle',
    COOP: 'coop'
};

function setup() {
    createCanvas(windowWidth, windowHeight);
    ball = new Ball(mouseX, mouseY);
    target = new Target();
    initializeMultiplayer();
}

function draw() {
    background(20);
    
    if (!gameStarted) {
        // Show waiting screen if needed
        showWaitingScreen();
        return;
    }
    
    // Mode-specific updates
    switch (gameMode) {
        case GAME_MODES.TEAM:
            updateTeamMode();
            break;
        case GAME_MODES.BATTLE:
            updateBattleMode();
            break;
        case GAME_MODES.COOP:
            updateCoopMode();
            break;
        default:
            updateClassicMode();
    }
    
    // Common updates
    updateBall();
    drawOpponentBalls();
    displayGameInfo();
}

function updateBall() {
    // Handle keyboard input
    if (keyIsDown(LEFT_ARROW)) {
        ball.move(-1);
    }
    if (keyIsDown(RIGHT_ARROW)) {
        ball.move(1);
    }
    
    // Update ball position if not active
    if (!ball.active) {
        ball.x = mouseX;
        ball.y = mouseY;
    }
    
    ball.update();
    
    // Send ball position to other players
    if (ball.active) {
        sendBallUpdate(ball);
    }
    
    // Reset ball if too low
    if (ball.y > height + 100) {
        ball.active = false;
        canDrop = true;
    }
}

function updateClassicMode() {
    target.update();
    target.draw();
    
    if (ball.active && checkCollision(ball, target)) {
        handleScoring();
    }
}

function updateTeamMode() {
    target.update();
    target.draw();
    
    // Draw team-colored balls
    const playerTeam = players.get(socket.id)?.team;
    if (playerTeam) {
        push();
        fill(playerTeam);
        ball.draw();
        pop();
    }
    
    if (ball.active && checkCollision(ball, target)) {
        handleTeamScoring();
    }
}

function updateBattleMode() {
    target.update();
    target.draw();
    
    // Update and draw power-ups
    updatePowerUps();
    
    if (ball.active && checkCollision(ball, target)) {
        handleBattleScoring();
    }
}

function updateCoopMode() {
    // Shared target between players
    if (isHost()) {
        target.update();
        socket.emit('target-moved', { x: target.x, y: target.y });
    }
    target.draw();
    
    if (ball.active && checkCollision(ball, target)) {
        handleCoopScoring();
    }
}

function handleScoring() {
    score++;
    sendScoreUpdate(score);
    ball.active = false;
    canDrop = true;
}

function handleTeamScoring() {
    score++;
    sendScoreUpdate(score);
    ball.active = false;
    canDrop = true;
}

function handleBattleScoring() {
    score++;
    sendScoreUpdate(score);
    // Generate power-up for scoring player
    spawnPowerUp(ball.x, ball.y);
    ball.active = false;
    canDrop = true;
}

function handleCoopScoring() {
    score++;
    sendScoreUpdate(score);
    // Make target harder to hit in co-op mode
    target.speed *= 1.1;
    ball.active = false;
    canDrop = true;
}

function showWaitingScreen() {
    push();
    textSize(32);
    textAlign(CENTER, CENTER);
    fill(255);
    text('Waiting for players...', width/2, height/2);
    text('Select a game mode to begin', width/2, height/2 + 40);
    pop();
}

function mousePressed() {
    if (canDrop) {
        ball.active = true;
        canDrop = false;
        // Initial velocity based on height
        ball.vy = map(mouseY, height, 0, 1, 20);
    }
}

function keyPressed() {
    // Game mode selection
    switch(key) {
        case '1':
            gameMode = GAME_MODES.CLASSIC;
            gameStarted = true;
            break;
        case '2':
            gameMode = GAME_MODES.TEAM;
            gameStarted = true;
            break;
        case '3':
            gameMode = GAME_MODES.BATTLE;
            gameStarted = true;
            break;
        case '4':
            gameMode = GAME_MODES.COOP;
            gameStarted = true;
            break;
    }
}