const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Store active players
const players = new Map();

io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);
    
    // Add new player
    players.set(socket.id, {
        id: socket.id,
        score: 0,
        ball: null
    });
    
    // Broadcast player list
    io.emit('players-update', Array.from(players.values()));
    
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
            io.emit('players-update', Array.from(players.values()));
        }
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
        players.delete(socket.id);
        io.emit('player-disconnected', socket.id);
        io.emit('players-update', Array.from(players.values()));
    });
});

const PORT = 3001;
http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});