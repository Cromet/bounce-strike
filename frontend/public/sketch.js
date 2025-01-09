let ball;
let target;
let score = 0;
let canDrop = true;
let difficulty = 0; // 0: Easy, 1: Medium, 2: Hard

function setup() {
    createCanvas(windowWidth, windowHeight);
    ball = new Ball(mouseX, mouseY);
    target = new Target(difficulty);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    target.y = height - target.height;
}

function draw() {
    background(20);
    
    // Handle keyboard input for ball movement
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
    
    // Check for collision with target
    if (ball.active && checkCollision(ball, target)) {
        score++;
        ball.active = false;
        canDrop = true;
    }
    
    // Reset ball if it's too low
    if (ball.y > height + 100) {
        ball.active = false;
        canDrop = true;
    }
    
    // Draw everything
    target.draw();
    ball.draw();
    displayScore(score);
    displayDifficulty(difficulty);
    displayControls();
}

function mousePressed() {
    if (canDrop) {
        ball.active = true;
        canDrop = false;
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