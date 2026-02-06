const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// 프론트엔드 빌드 파일 서빙 (배포 시 필수)
app.use(express.static(path.join(__dirname, '../frontend/dist')));

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const { db, dbAsync } = require('./db');

app.get('/api/health', (req, res) => {
    res.send('Quiet Map Backend is running (Production Ready)');
});

// 모든 요청을 React의 index.html로 보냄 (SPA 라우팅 지원)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

io.on('connection', async (socket) => {
    console.log('User connected:', socket.id);

    // Send existing data from DB
    try {
        const rows = await dbAsync.all("SELECT * FROM markers ORDER BY timestamp DESC LIMIT 100");
        // Convert flat rows back to nested object if needed, or frontend handles it
        // Our frontend expects { location: { lat, lng }, ... }
        // Let's map it back
        const formattedData = rows.map(row => ({
            id: row.id,
            db: row.db,
            timestamp: row.timestamp,
            location: { lat: row.lat, lng: row.lng }
        }));
        socket.emit('initial_data', formattedData);
    } catch (err) {
        console.error("Error fetching initial data:", err);
    }

    socket.on('submit_noise_data', async (data) => {
        console.log('Received noise data:', data);

        // 1. Validate / Cap
        let dbVal = parseFloat(data.db);
        if (isNaN(dbVal)) return;

        if (dbVal > 80) dbVal = 80;
        if (dbVal < 0) dbVal = 0;

        let location = data.location;

        // Validate location data
        if (!location || typeof location.lat !== 'number' || typeof location.lng !== 'number') {
            console.log('Invalid or missing location data. Rejecting submission.');
            return; // Reject submission without location
        }

        const id = Date.now().toString();
        const timestamp = Date.now();

        // 2. Store in DB
        try {
            await dbAsync.run(
                `INSERT INTO markers (id, lat, lng, db, timestamp) VALUES (?, ?, ?, ?, ?)`,
                [id, location.lat, location.lng, Math.round(dbVal), timestamp]
            );

            const cleanData = {
                id: id,
                db: Math.round(dbVal),
                timestamp: timestamp,
                location: location
            };

            // 3. Broadcast
            io.emit('new_noise_report', cleanData);

        } catch (err) {
            console.error("Error saving marker:", err);
        }
    });

    socket.on('delete_marker', async (id) => {
        console.log('Deleting marker:', id);
        try {
            await dbAsync.run("DELETE FROM markers WHERE id = ?", [id]);
            io.emit('marker_deleted', id);
        } catch (err) {
            console.error("Error deleting marker:", err);
        }
    });

    // Review Handlers
    socket.on('submit_review', async (data) => {
        // data: { markerId, text, tags[], timestamp }
        console.log('Received review:', data);
        try {
            const tagsStr = JSON.stringify(data.tags || []);
            await dbAsync.run(
                `INSERT INTO reviews (markerId, text, tags, timestamp) VALUES (?, ?, ?, ?)`,
                [data.markerId, data.text, tagsStr, data.timestamp]
            );

            // Broadcast new review
            io.emit('new_review', data);
        } catch (err) {
            console.error("Error saving review:", err);
        }
    });

    socket.on('get_reviews', async (markerId) => {
        try {
            // Support both string/int ID matching just in case
            const rows = await dbAsync.all(
                "SELECT * FROM reviews WHERE markerId = ? ORDER BY timestamp DESC",
                [markerId]
            );
            const reviews = rows.map(r => ({
                ...r,
                tags: JSON.parse(r.tags || '[]')
            }));
            socket.emit('reviews_data', reviews);
        } catch (err) {
            console.error("Error fetching reviews:", err);
            socket.emit('reviews_data', []);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is live! Listening on port ${PORT}`);
});
