const express = require('express');
const app = express();
const http = require('http').createServer(app);
const { Server } = require('socket.io');
const io = new Server(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
const path = require('path');

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, 'frontend')));
app.use(express.static(path.join(__dirname, 'frontend/public')));
app.use(express.static(path.join(__dirname, 'frontend/src/app')));

// Serve the main HTML page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend/src/app/index.html'));
});

// Create a basic index.html file
const fs = require('fs');
const indexPath = path.join(__dirname, 'frontend/src/app/index.html');
const indexContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bounce Strike</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            overflow: hidden;
            background: #000;
        }
    </style>
</head>
<body>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.11.2/p5.min.js"></script>
    <script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
    <script src="/ui.js"></script>
    <script src="/helpers.js"></script>
    <script src="/objects.js"></script>
    <script src="/sketch.js"></script>
</body>
</html>
`;

// Create the index.html file if it doesn't exist
if (!fs.existsSync(indexPath)) {
    const dir = path.dirname(indexPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(indexPath, indexContent);
}

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);
    
    // Add new player
    players.set(socket.id, {
        id: socket.id,
        score: 0,
        ball: null
    });
    
    // Broadcast new player to others
    socket.broadcast.emit('playerJoined', socket.id);
    
    // Send existing players to new player
    const existingPlayers = Array.from(players.keys()).filter(id => id !== socket.id);
    socket.emit('existingPlayers', existingPlayers);
    
    // Handle ball updates
    socket.on('ball-update', (ballData) => {
        const player = players.get(socket.id);
        if (player) {
            player.ball = ballData;
            socket.broadcast.emit('opponent-ball-update', {
                id: socket.id,
                ball: ballData
            });
        }
    });
    
    // Handle score updates
    socket.on('score-update', (score) => {
        const player = players.get(socket.id);
        if (player) {
            player.score = score;
            socket.broadcast.emit('score-update', {
                id: socket.id,
                score: score
            });
        }
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
        players.delete(socket.id);
        io.emit('player-disconnected', socket.id);
    });
});

const PORT = process.env.PORT || 3001;
http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Initialize players Map at the top level
const players = new Map();