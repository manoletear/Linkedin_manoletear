require('dotenv').config();
const express = require('express');
const session = require('express-session');
const authRoutes = require('./routes/auth');
const linkedinRoutes = require('./routes/linkedin');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(session({
    secret: process.env.SESSION_SECRET || 'linkedin-tool-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }
}));

// Auth middleware
function requireAuth(req, res, next) {
    if (!req.session.accessToken) {
        return res.status(401).json({ error: 'No autenticado. Inicia sesión con LinkedIn.' });
    }
    next();
}

// Routes
app.use('/auth', authRoutes);
app.use('/api/linkedin', requireAuth, linkedinRoutes);

// Auth status endpoint
app.get('/api/status', (req, res) => {
    res.json({
        authenticated: !!req.session.accessToken,
        user: req.session.userProfile || null
    });
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
