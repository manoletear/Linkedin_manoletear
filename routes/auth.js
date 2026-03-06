const express = require('express');
const axios = require('axios');
const router = express.Router();

const LINKEDIN_AUTH_URL = 'https://www.linkedin.com/oauth/v2/authorization';
const LINKEDIN_TOKEN_URL = 'https://www.linkedin.com/oauth/v2/accessToken';
const LINKEDIN_USERINFO_URL = 'https://api.linkedin.com/v2/userinfo';

// Scopes needed: posting, commenting, reacting, profile
const SCOPES = [
    'openid',
    'profile',
    'email',
    'w_member_social'
].join(' ');

// Step 1: Redirect to LinkedIn for authorization
router.get('/linkedin', (req, res) => {
    const clientId = process.env.LINKEDIN_CLIENT_ID;
    const redirectUri = process.env.LINKEDIN_REDIRECT_URI;

    if (!clientId || !redirectUri) {
        return res.status(500).json({
            error: 'Configura LINKEDIN_CLIENT_ID y LINKEDIN_REDIRECT_URI en .env'
        });
    }

    const state = Math.random().toString(36).substring(2);
    req.session.oauthState = state;

    const authUrl = `${LINKEDIN_AUTH_URL}?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(SCOPES)}`;

    res.redirect(authUrl);
});

// Step 2: Handle OAuth callback
router.get('/linkedin/callback', async (req, res) => {
    const { code, state, error } = req.query;

    if (error) {
        return res.redirect('/?error=' + encodeURIComponent(error));
    }

    if (state !== req.session.oauthState) {
        return res.redirect('/?error=invalid_state');
    }

    try {
        // Exchange code for access token
        const tokenResponse = await axios.post(LINKEDIN_TOKEN_URL, null, {
            params: {
                grant_type: 'authorization_code',
                code,
                redirect_uri: process.env.LINKEDIN_REDIRECT_URI,
                client_id: process.env.LINKEDIN_CLIENT_ID,
                client_secret: process.env.LINKEDIN_CLIENT_SECRET
            },
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        const { access_token, expires_in } = tokenResponse.data;
        req.session.accessToken = access_token;
        req.session.tokenExpiry = Date.now() + (expires_in * 1000);

        // Fetch user profile
        const profileResponse = await axios.get(LINKEDIN_USERINFO_URL, {
            headers: { Authorization: `Bearer ${access_token}` }
        });

        req.session.userProfile = {
            sub: profileResponse.data.sub,
            name: profileResponse.data.name,
            email: profileResponse.data.email,
            picture: profileResponse.data.picture
        };

        res.redirect('/dashboard.html');
    } catch (err) {
        console.error('OAuth error:', err.response?.data || err.message);
        res.redirect('/?error=auth_failed');
    }
});

// Logout
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;
