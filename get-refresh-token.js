require('dotenv').config();
const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

// These scopes allow access to user's currently playing and recently played tracks
const SCOPES = 'user-read-currently-playing user-read-recently-played';

// Generate random state string for security
const state = Math.random().toString(36).substring(7);

app.get('/login', (req, res) => {
    const spotifyAuthUrl = 'https://accounts.spotify.com/authorize?' + 
        new URLSearchParams({
            response_type: 'code',
            client_id: process.env.SPOTIFY_CLIENT_ID,
            scope: SCOPES,
            redirect_uri: `http://localhost:${PORT}/callback`,
            state: state
        }).toString();
    
    res.redirect(spotifyAuthUrl);
});

app.get('/callback', async (req, res) => {
    const code = req.query.code;
    
    try {
        const response = await axios.post('https://accounts.spotify.com/api/token',
            new URLSearchParams({
                code: code,
                redirect_uri: `http://localhost:${PORT}/callback`,
                grant_type: 'authorization_code'
            }), {
                headers: {
                    'Authorization': `Basic ${Buffer.from(
                        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
                    ).toString('base64')}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );

        // Display the refresh token
        res.send(`
            <h1>Your Refresh Token</h1>
            <p>Add this to your .env file as SPOTIFY_REFRESH_TOKEN:</p>
            <code>${response.data.refresh_token}</code>
        `);
        
    } catch (error) {
        console.error('Error getting tokens:', error.message);
        res.send('Error getting tokens. Check console for details.');
    }
});

app.listen(PORT, () => {
    console.log(`
    1. Go to https://developer.spotify.com/dashboard
    2. Create a new app if you haven't already
    3. Get your Client ID and Client Secret
    4. Add http://localhost:${PORT}/callback to your app's Redirect URIs in the Spotify Dashboard
    5. Update your .env file with your Client ID and Client Secret
    6. Then visit http://localhost:${PORT}/login to get your refresh token
    `);
});
