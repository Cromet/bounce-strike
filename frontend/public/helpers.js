let socket;
let gameModeMenu;
const players = new Map();

// Add global gameState object
const gameState = {
    mode: null,
    score: 0,
    gameStarted: false
};

function initializeMultiplayer() {
    socket = io('http://localhost:3001', {
        transports: ['websocket'],
        reconnection: true
    });
    
    gameModeMenu = new GameModeMenu();
    
    socket.on('connect', () => {
        console.log('Connected to server with ID:', socket.id);
        gameModeMenu.show();
    });
    
    socket.on('room-joined', (data) => {
        gameState.mode = data.mode;
        players.clear();
        data.players.forEach(id => {
            players.set(id, {
                ball: null,
                score: data.scores[id],
                team: data.teams?.[id]
            });
        });
        gameState.gameStarted = true;
        setupGameMode(gameState.mode);
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

function displayGameInfo() {
    push();
    textSize(24);
    textAlign(LEFT, TOP);
    fill(255);
    
    // Display mode-specific info
    switch (gameState.mode) {
        case 'team':
            text(`Team Mode - Score: ${gameState.score}`, 20, 20);
            break;
        case 'battle':
            text(`Battle Mode - Score: ${gameState.score}`, 20, 20);
            break;
        case 'coop':
            text(`Co-op Mode - Score: ${gameState.score}`, 20, 20);
            break;
        default:
            text(`Classic Mode - Score: ${gameState.score}`, 20, 20);
    }
    
    // Display players
    let yPos = 60;
    players.forEach((player, id) => {
        text(`Player ${id.slice(0,4)}: ${player.score}`, 20, yPos);
        yPos += 30;
    });
    pop();
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

// Placeholder functions for mode-specific setups
function setupTeamMode() {}
function setupBattleMode() {}
function setupCoopMode() {}
function setupClassicMode() {}

function setupGameMode(mode) {
    switch (mode) {
        case 'team':
            setupTeamMode();
            break;
        case 'battle':
            setupBattleMode();
            break;
        case 'coop':
            setupCoopMode();
            break;
        default:
            setupClassicMode();
    }
}

function joinRoom(mode) {
    socket.emit('join-room', mode);
}