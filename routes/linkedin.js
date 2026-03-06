const express = require('express');
const axios = require('axios');
const router = express.Router();

const LINKEDIN_API = 'https://api.linkedin.com';

function getHeaders(req) {
    return {
        Authorization: `Bearer ${req.session.accessToken}`,
        'Content-Type': 'application/json',
        'LinkedIn-Version': '202401',
        'X-Restli-Protocol-Version': '2.0.0'
    };
}

// ========== POSTS ==========

// Create a text post
router.post('/posts', async (req, res) => {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'El texto es requerido' });

    try {
        const personUrn = `urn:li:person:${req.session.userProfile.sub}`;
        const response = await axios.post(`${LINKEDIN_API}/rest/posts`, {
            author: personUrn,
            commentary: text,
            visibility: 'PUBLIC',
            distribution: {
                feedDistribution: 'MAIN_FEED',
                targetEntities: [],
                thirdPartyDistributionChannels: []
            },
            lifecycleState: 'PUBLISHED'
        }, { headers: getHeaders(req) });

        const postId = response.headers['x-restli-id'] || response.headers['x-linkedin-id'];
        res.json({ success: true, postId, message: 'Post publicado exitosamente' });
    } catch (err) {
        console.error('Error creating post:', err.response?.data || err.message);
        res.status(err.response?.status || 500).json({
            error: 'Error al publicar',
            details: err.response?.data
        });
    }
});

// Get my posts (feed)
router.get('/posts', async (req, res) => {
    try {
        const personUrn = `urn:li:person:${req.session.userProfile.sub}`;
        const response = await axios.get(`${LINKEDIN_API}/rest/posts`, {
            params: {
                author: personUrn,
                q: 'author',
                count: 20
            },
            headers: getHeaders(req)
        });

        res.json(response.data);
    } catch (err) {
        console.error('Error fetching posts:', err.response?.data || err.message);
        res.status(err.response?.status || 500).json({
            error: 'Error al obtener posts',
            details: err.response?.data
        });
    }
});

// Delete a post
router.delete('/posts/:postId', async (req, res) => {
    try {
        await axios.delete(`${LINKEDIN_API}/rest/posts/${encodeURIComponent(req.params.postId)}`, {
            headers: getHeaders(req)
        });
        res.json({ success: true, message: 'Post eliminado' });
    } catch (err) {
        console.error('Error deleting post:', err.response?.data || err.message);
        res.status(err.response?.status || 500).json({
            error: 'Error al eliminar post',
            details: err.response?.data
        });
    }
});

// ========== COMMENTS ==========

// Get comments on a post
router.get('/posts/:postId/comments', async (req, res) => {
    try {
        const response = await axios.get(`${LINKEDIN_API}/rest/socialActions/${encodeURIComponent(req.params.postId)}/comments`, {
            headers: getHeaders(req)
        });
        res.json(response.data);
    } catch (err) {
        console.error('Error fetching comments:', err.response?.data || err.message);
        res.status(err.response?.status || 500).json({
            error: 'Error al obtener comentarios',
            details: err.response?.data
        });
    }
});

// Reply to a post or comment
router.post('/posts/:postId/comments', async (req, res) => {
    const { text, parentComment } = req.body;
    if (!text) return res.status(400).json({ error: 'El texto es requerido' });

    try {
        const personUrn = `urn:li:person:${req.session.userProfile.sub}`;
        const payload = {
            actor: personUrn,
            message: { text }
        };

        if (parentComment) {
            payload.parentComment = parentComment;
        }

        const response = await axios.post(
            `${LINKEDIN_API}/rest/socialActions/${encodeURIComponent(req.params.postId)}/comments`,
            payload,
            { headers: getHeaders(req) }
        );

        res.json({ success: true, data: response.data, message: 'Comentario publicado' });
    } catch (err) {
        console.error('Error creating comment:', err.response?.data || err.message);
        res.status(err.response?.status || 500).json({
            error: 'Error al comentar',
            details: err.response?.data
        });
    }
});

// ========== REACTIONS (Likes / Thumbs Up) ==========

// React to a post (LIKE)
router.post('/posts/:postId/reactions', async (req, res) => {
    const { reactionType } = req.body;
    const validReactions = ['LIKE', 'PRAISE', 'EMPATHY', 'INTEREST', 'APPRECIATION'];
    const reaction = validReactions.includes(reactionType) ? reactionType : 'LIKE';

    try {
        const personUrn = `urn:li:person:${req.session.userProfile.sub}`;
        await axios.post(
            `${LINKEDIN_API}/rest/reactions`,
            {
                root: req.params.postId,
                reactionType: reaction,
                actor: personUrn
            },
            { headers: getHeaders(req) }
        );

        res.json({ success: true, message: `Reacción '${reaction}' añadida` });
    } catch (err) {
        console.error('Error adding reaction:', err.response?.data || err.message);
        res.status(err.response?.status || 500).json({
            error: 'Error al reaccionar',
            details: err.response?.data
        });
    }
});

// Get reactions on a post
router.get('/posts/:postId/reactions', async (req, res) => {
    try {
        const response = await axios.get(
            `${LINKEDIN_API}/rest/socialActions/${encodeURIComponent(req.params.postId)}/likes`,
            { headers: getHeaders(req) }
        );
        res.json(response.data);
    } catch (err) {
        console.error('Error fetching reactions:', err.response?.data || err.message);
        res.status(err.response?.status || 500).json({
            error: 'Error al obtener reacciones',
            details: err.response?.data
        });
    }
});

// ========== PROFILE ==========

// Get current user profile
router.get('/profile', (req, res) => {
    res.json(req.session.userProfile);
});

module.exports = router;
