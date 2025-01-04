require('dotenv').config();
const express = require('express');
const axios = require('axios');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const { truncateText } = require('./utils');

const app = express();
const PORT = process.env.PORT || 3000;

// Spotify API configuration
const SPOTIFY_API = 'https://api.spotify.com/v1';
let accessToken = null;

async function refreshSpotifyToken() {
    try {
        console.log('Attempting to refresh token...');
        console.log('Using refresh token:', process.env.SPOTIFY_REFRESH_TOKEN.substring(0, 10) + '...');
        
        const response = await axios.post('https://accounts.spotify.com/api/token', 
            new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: process.env.SPOTIFY_REFRESH_TOKEN
            }), {
                headers: {
                    'Authorization': `Basic ${Buffer.from(
                        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
                    ).toString('base64')}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
        
        accessToken = response.data.access_token;
        console.log('Token refreshed successfully!');
        console.log('New access token:', accessToken.substring(0, 10) + '...');
        
        setTimeout(refreshSpotifyToken, (response.data.expires_in - 60) * 1000);
    } catch (error) {
        console.error('Error refreshing token:', error.message);
        if (error.response) {
            console.error('Error details:', error.response.data);
        }
        setTimeout(refreshSpotifyToken, 30000); // Retry after 30 seconds
    }
}

async function getRecentTrack() {
    try {
        console.log('Fetching currently playing track...');
        console.log('Using access token:', accessToken ? accessToken.substring(0, 10) + '...' : 'null');
        
        const response = await axios.get(`${SPOTIFY_API}/me/player/currently-playing`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        console.log('Current playing response status:', response.status);
        
        if (response.data && response.data.item) {
            console.log('Found currently playing track:', response.data.item.name);
            return response.data.item;
        }
        
        console.log('No currently playing track, checking recently played...');
        
        const recentResponse = await axios.get(`${SPOTIFY_API}/me/player/recently-played?limit=1`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        if (recentResponse.data.items && recentResponse.data.items.length > 0) {
            console.log('Found recent track:', recentResponse.data.items[0].track.name);
            return recentResponse.data.items[0].track;
        }
        
        console.log('No recent tracks found');
        return null;
    } catch (error) {
        console.error('Error fetching recent track:', error.message);
        if (error.response) {
            console.error('Error details:', error.response.data);
        }
        return null;
    }
}

async function generateImage(track) {
    try {
        const background = sharp(path.join(__dirname, 'background.png'));

        console.log('Fetching album art from URL:', track.album.images[0].url);

        let albumArtBuffer;
        try {
            const response = await axios.get(track.album.images[0].url, { responseType: 'arraybuffer' });
            albumArtBuffer = Buffer.from(response.data, 'binary');
            console.log('Successfully fetched album art, size:', albumArtBuffer.length, 'bytes');
        } catch (error) {
            console.error('Error fetching album art:', error);
            throw new Error('Failed to fetch album art');
        }

        let albumArt;
        try {
            albumArt = sharp(albumArtBuffer);
            console.log('Successfully created sharp instance from album art');
        } catch (error) {
            console.error('Error creating sharp instance from album art:', error);
            throw new Error('Invalid album art data');
        }

        let resizedAlbumArt;
        try {
            resizedAlbumArt = await albumArt.resize(92, 92).toBuffer();
            console.log('Successfully resized album art');
        } catch (error) {
            console.error('Error resizing album art:', error);
            throw new Error('Failed to resize album art');
        }

        const roundedCorners = Buffer.from(`
            <svg><rect x="0" y="0" width="92" height="92" rx="10" ry="10"/></svg>
        `);

        const roundedAlbumArt = await sharp(resizedAlbumArt)
            .composite([{
                input: roundedCorners,
                blend: 'dest-in'
            }])
            .png()
            .toBuffer();

        const truncatedName = truncateText(track.name, 36);
        const truncatedArtist = track.artists[0].name;

        const backgroundMetadata = await background.metadata();
        const { width, height } = backgroundMetadata;

        const escapedName = truncatedName.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const escapedArtist = truncatedArtist.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        const textOverlay = Buffer.from(`
            <svg width="${width}" height="${height}">
                <text x="141" y="70" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="white">${escapedName}</text>
                <text x="141" y="100" font-family="Arial, sans-serif" font-size="16" fill="white">${escapedArtist}</text>
            </svg>
        `);

        let finalImage;
        try {
            finalImage = await background
                .composite([
                    { input: roundedAlbumArt, top: 30, left: 34 },
                ])
                .png()
                .toBuffer();

            finalImage = await sharp(finalImage)
                .composite([
                    { input: textOverlay, top: 0, left: 0 },
                ])
                .png()
                .toBuffer();

            console.log('Successfully generated final image');
        } catch (error) {
            console.error('Error generating final image:', error);
            finalImage = await background
                .composite([
                    { input: roundedAlbumArt, top: 30, left: 34 },
                ])
                .png()
                .toBuffer();
            console.log('Generated fallback image without text overlay');
        }

        return finalImage;
    } catch (error) {
        console.error('Error generating image:', error);
        throw error;
    }
}

// Endpoint to serve the image
app.get('/nowplaying.png', async (req, res) => {
    try {
        const track = await getRecentTrack();
        if (!track) {
            res.status(404).send('No recent track found');
            return;
        }

        const image = await generateImage(track);
        // Set headers to prevent caching
        res.setHeader('Content-Type', 'image/png');
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        res.setHeader('Surrogate-Control', 'no-store');
        // Add a random query parameter to the image to bust GitHub's cache
        res.setHeader('ETag', Math.random().toString(36));
        res.send(image);
    } catch (error) {
        console.error('Error serving image:', error);
        res.status(500).send('Error generating image');
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    refreshSpotifyToken(); // Initial token refresh
});
