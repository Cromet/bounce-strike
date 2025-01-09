class Ball {
  constructor(x, y, size = 20) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.vy = 0;  // Vertical velocity
    this.gravity = 0.6;  // Gravity effect
    this.bounce = -0.7;  // Bounce factor
    this.active = false; // Is ball in play?
  }

  update() {
    if (!this.active) return;
    
    // Apply gravity
    this.vy += this.gravity;
    this.y += this.vy;

    // Ground collision with bounce
    if (this.y + this.size/2 > height) {
      this.y = height - this.size/2;
      this.vy *= this.bounce;
    }
  }

  draw() {
    fill(255);
    noStroke();
    circle(this.x, this.y, this.size);
  }
}

class Target {
  constructor() {
    this.width = 60;
    this.height = 10;
    this.y = height - this.height;
    this.x = width/2;
    this.speed = 4;
    this.direction = 1;
  }

  update() {
    // Move back and forth
    this.x += this.speed * this.direction;
    
    // Reverse at edges
    if (this.x + this.width/2 > width || this.x - this.width/2 < 0) {
      this.direction *= -1;
    }
  }

  draw() {
    fill(255, 0, 0);
    rectMode(CENTER);
    rect(this.x, this.y, this.width, this.height);
  }
}