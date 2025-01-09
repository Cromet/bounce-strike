let ball;
let target;
let score = 0;
let canDrop = true;

function setup() {
  createCanvas(windowWidth, windowHeight);
  ball = new Ball(mouseX, mouseY);
  target = new Target();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // Reset target position on resize
  target.y = height - target.height;
}

function draw() {
  background(20); // Dark background for better contrast
  
  // Update ball position if mouse is pressed
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
}

function mousePressed() {
  if (canDrop) {
    ball.active = true;
    canDrop = false;
    // Initial velocity based on height
    ball.vy = map(mouseY, height, 0, 1, 20);
  }
}