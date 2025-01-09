class GameModeMenu {
    constructor() {
        this.modes = [
            {
                id: 'classic',
                name: 'Classic Mode',
                description: 'Classic bounce gameplay. Score points by hitting the target!',
                color: '#4CAF50',
                icon: '🎯'
            },
            {
                id: 'team',
                name: 'Team Battle',
                description: 'Join red or blue team. Work together to outscore the opposition!',
                color: '#2196F3',
                icon: '⚔️'
            },
            {
                id: 'battle',
                name: 'Power-up Battle',
                description: 'Collect power-ups and sabotage other players!',
                color: '#FF9800',
                icon: '⚡'
            },
            {
                id: 'coop',
                name: 'Co-op Challenge',
                description: 'Work together to achieve the highest combined score!',
                color: '#E91E63',
                icon: '🤝'
            }
        ];
        
        this.selectedMode = null;
        this.hoverIndex = -1;
        this.active = false;
        this.buttonWidth = 300;
        this.buttonHeight = 100;
        this.padding = 20;
    }

    show() {
        this.active = true;
    }

    hide() {
        this.active = false;
    }

    draw() {
        if (!this.active) return;

        // Dim background
        push();
        background(0, 0, 0, 200);
        
        // Draw title
        textAlign(CENTER, CENTER);
        textSize(48);
        fill(255);
        text('SELECT GAME MODE', width/2, height/6);
        
        // Calculate layout
        const startY = height/3;
        const totalHeight = this.modes.length * (this.buttonHeight + this.padding);
        
        // Draw mode buttons
        this.modes.forEach((mode, index) => {
            const x = width/2 - this.buttonWidth/2;
            const y = startY + index * (this.buttonHeight + this.padding);
            
            // Check hover
            const isHover = this.isMouseOver(x, y);
            const isSelected = this.selectedMode === mode.id;
            
            // Draw button background
            push();
            if (isSelected) {
                fill(color(mode.color));
            } else if (isHover) {
                fill(color(mode.color + '80')); // Semi-transparent
            } else {
                fill(30);
            }
            stroke(color(mode.color));
            strokeWeight(2);
            rect(x, y, this.buttonWidth, this.buttonHeight, 10);
            
            // Draw mode icon
            textSize(32);
            textAlign(LEFT, CENTER);
            text(mode.icon, x + 20, y + this.buttonHeight/2);
            
            // Draw mode name
            fill(255);
            noStroke();
            textSize(24);
            text(mode.name, x + 70, y + this.buttonHeight/3);
            
            // Draw mode description
            textSize(14);
            fill(200);
            text(mode.description, x + 70, y + this.buttonHeight/3 * 2);
            pop();
        });
        
        // Draw player count if in multiplayer
        if (socket && players) {
            textSize(20);
            fill(150);
            text(`${players.size} player${players.size !== 1 ? 's' : ''} online`, 
                 width/2, height - 50);
        }
        pop();
    }

    isMouseOver(x, y) {
        return mouseX >= x && mouseX <= x + this.buttonWidth &&
               mouseY >= y && mouseY <= y + this.buttonHeight;
    }

    handleClick() {
        if (!this.active) return;

        const startY = height/3;
        
        this.modes.forEach((mode, index) => {
            const x = width/2 - this.buttonWidth/2;
            const y = startY + index * (this.buttonHeight + this.padding);
            
            if (this.isMouseOver(x, y)) {
                this.selectedMode = mode.id;
                this.hide();
                joinRoom(mode.id);
            }
        });
    }

    handleHover() {
        if (!this.active) return;
        
        const startY = height/3;
        let foundHover = false;
        
        this.modes.forEach((mode, index) => {
            const x = width/2 - this.buttonWidth/2;
            const y = startY + index * (this.buttonHeight + this.padding);
            
            if (this.isMouseOver(x, y)) {
                foundHover = true;
                if (this.hoverIndex !== index) {
                    this.hoverIndex = index;
                    cursor(HAND);
                }
            }
        });
        
        if (!foundHover && this.hoverIndex !== -1) {
            this.hoverIndex = -1;
            cursor(ARROW);
        }
    }
}