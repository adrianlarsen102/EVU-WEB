const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');

const app = express();
const PORT = 3000;
const DATA_FILE = './data/content.json';
const ADMIN_PASSWORD = 'JJt33twzz!!'; // Change this to a secure password

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('.'));
app.use(session({
    secret: 'evu-admin-secret-key-change-this',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Authentication middleware
function requireAuth(req, res, next) {
    if (req.session.authenticated) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
}

// Login endpoint
app.post('/api/login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        req.session.authenticated = true;
        res.json({ success: true });
    } else {
        res.status(401).json({ error: 'Invalid password' });
    }
});

// Logout endpoint
app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// Check authentication status
app.get('/api/auth/check', (req, res) => {
    res.json({ authenticated: !!req.session.authenticated });
});

// Get all content
app.get('/api/content', async (req, res) => {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.status(500).json({ error: 'Failed to read content' });
    }
});

// Update content (protected)
app.post('/api/content', requireAuth, async (req, res) => {
    try {
        const content = req.body;
        await fs.writeFile(DATA_FILE, JSON.stringify(content, null, 2));
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save content' });
    }
});

// Update specific section (protected)
app.post('/api/content/:section', requireAuth, async (req, res) => {
    try {
        const section = req.params.section;
        const data = await fs.readFile(DATA_FILE, 'utf8');
        const content = JSON.parse(data);

        content[section] = req.body;

        await fs.writeFile(DATA_FILE, JSON.stringify(content, null, 2));
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Failed to update section' });
    }
});

// Get server status
app.get('/api/status', async (req, res) => {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        const content = JSON.parse(data);
        res.json(content.serverStatus || {});
    } catch (error) {
        res.status(500).json({ error: 'Failed to read status' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Admin panel: http://localhost:${PORT}/admin.html`);
});
