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