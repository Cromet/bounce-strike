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

// Serve static files
app.use(express.static(path.join(__dirname, 'frontend/public')));
app.use(express.static(path.join(__dirname, 'frontend')));

// Store active players, rooms, and leaderboards
const players = new Map();
const rooms = new Map();
const leaderboards = new Map();

// Game mode configurations
const GAME_MODES = {
    CLASSIC: 'classic',
    TEAM: 'team',
    BATTLE: 'battle',
    COOP: 'coop'
};

function createRoom(mode) {
    return {
        mode: mode,
        players: new Set(),
        scores: new Map(),
        teams: new Map(), // for team mode
        targetPos: { x: 0, y: 0 }, // shared target position for co-op mode
        powerUps: [] // for battle mode
    };
}

io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);
    
    // Handle room joining
    socket.on('join-room', (mode) => {
        // Leave current room if any
        if (socket.roomId) {
            const currentRoom = rooms.get(socket.roomId);
            if (currentRoom) {
                currentRoom.players.delete(socket.id);
                socket.leave(socket.roomId);
            }
        }
        
        // Find or create room for selected mode
        let roomId = null;
        for (const [id, room] of rooms.entries()) {
            if (room.mode === mode && room.players.size < 4) {
                roomId = id;
                break;
            }
        }
        
        if (!roomId) {
            roomId = `${mode}-${Date.now()}`;
            rooms.set(roomId, createRoom(mode));
        }
        
        // Join room
        const room = rooms.get(roomId);
        room.players.add(socket.id);
        room.scores.set(socket.id, 0);
        socket.roomId = roomId;
        socket.join(roomId);
        
        // Assign team for team mode
        if (mode === GAME_MODES.TEAM) {
            const team = room.players.size % 2 === 0 ? 'red' : 'blue';
            room.teams.set(socket.id, team);
        }
        
        // Send room info to player
        socket.emit('room-joined', {
            roomId,
            mode,
            players: Array.from(room.players),
            scores: Object.fromEntries(room.scores),
            teams: mode === GAME_MODES.TEAM ? Object.fromEntries(room.teams) : null
        });
        
        // Notify other players
        socket.to(roomId).emit('player-joined-room', {
            playerId: socket.id,
            team: room.teams?.get(socket.id)
        });
    });
    
    // Handle game updates
    socket.on('ball-update', (ballData) => {
        if (socket.roomId) {
            socket.to(socket.roomId).emit('opponent-ball-update', {
                id: socket.id,
                ball: ballData,
                team: rooms.get(socket.roomId).teams?.get(socket.id)
            });
        }
    });
    
    socket.on('score-update', (score) => {
        if (socket.roomId) {
            const room = rooms.get(socket.roomId);
            room.scores.set(socket.id, score);
            
            // Handle team scoring
            if (room.mode === GAME_MODES.TEAM) {
                const teamScores = { red: 0, blue: 0 };
                room.scores.forEach((score, playerId) => {
                    const team = room.teams.get(playerId);
                    teamScores[team] += score;
                });
                io.to(socket.roomId).emit('team-scores-update', teamScores);
            }
            
            socket.to(socket.roomId).emit('score-update', {
                id: socket.id,
                score: score
            });
        }
    });
    
    // Handle battle mode actions
    socket.on('power-up-used', (data) => {
        if (socket.roomId) {
            socket.to(socket.roomId).emit('power-up-effect', {
                type: data.type,
                sourceId: socket.id,
                targetId: data.targetId
            });
        }
    });
    
    // Handle co-op mode target updates
    socket.on('target-moved', (pos) => {
        if (socket.roomId) {
            const room = rooms.get(socket.roomId);
            if (room.mode === GAME_MODES.COOP) {
                room.targetPos = pos;
                socket.to(socket.roomId).emit('target-update', pos);
            }
        }
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
        if (socket.roomId) {
            const room = rooms.get(socket.roomId);
            if (room) {
                room.players.delete(socket.id);
                room.scores.delete(socket.id);
                room.teams?.delete(socket.id);
                
                if (room.players.size === 0) {
                    rooms.delete(socket.roomId);
                } else {
                    io.to(socket.roomId).emit('player-left-room', socket.id);
                }
            }
        }
        players.delete(socket.id);
    });
});

const PORT = process.env.PORT || 3001;
http.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});