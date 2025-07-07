const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const accessPointsRouter = require('./routes/accessPoints');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:8080', 'http://127.0.0.1:8080'],
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from frontend (adjust path for Docker)
const frontendPath = process.env.NODE_ENV === 'production' 
    ? path.join(__dirname, 'public') 
    : path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// API Routes
app.use('/api/access-points', accessPointsRouter);
app.use('/api/geocoding', require('./routes/geocoding'));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Serve frontend for all non-API routes
app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
        const indexPath = process.env.NODE_ENV === 'production' 
            ? path.join(__dirname, 'public/index.html') 
            : path.join(__dirname, '../frontend/index.html');
        res.sendFile(indexPath);
    } else {
        res.status(404).json({ error: 'API endpoint not found' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\nReceived SIGINT. Graceful shutdown...');
    const db = require('./config/database');
    db.close();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\nReceived SIGTERM. Graceful shutdown...');
    const db = require('./config/database');
    db.close();
    process.exit(0);
});

app.listen(PORT, () => {
    console.log(`WiFi Access Point Registry server running on port ${PORT}`);
    console.log(`Frontend: http://localhost:${PORT}`);
    console.log(`API: http://localhost:${PORT}/api`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
