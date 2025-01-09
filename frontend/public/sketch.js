let ball;
let target;
let score = 0;
let canDrop = true;
let difficulty = 0;

function setup() {
    createCanvas(windowWidth, windowHeight);
    ball = new Ball(mouseX, mouseY);
    target = new Target(difficulty);
    
    // Initialize multiplayer connection
    initializeMultiplayer();
}

function draw() {
    background(20);
    
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
    
    // Update game objects
    ball.update();
    target.update();
    
    // Send ball position to other players
    if (ball.active) {
        sendBallUpdate(ball);
    }
    
    // Check for collision with target
    if (ball.active && checkCollision(ball, target)) {
        score++;
        sendScoreUpdate(score);
        ball.active = false;
        canDrop = true;
    }
    
    // Reset ball if too low
    if (ball.y > height + 100) {
        ball.active = false;
        canDrop = true;
    }
    
    // Draw everything
    target.draw();
    ball.draw();
    drawOpponentBalls();
    displayGameStats();
    displayDifficulty(difficulty);
    displayControls();
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
    // Difficulty controls
    if (key >= '1' && key <= '3') {
        difficulty = int(key) - 1;
        target.setDifficulty(difficulty);
    }
}