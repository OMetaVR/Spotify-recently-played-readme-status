const express = require('express');
const SpotifyWebApi = require('spotify-web-api-node');
const sharp = require('sharp');
const path = require('path');
const axios = require('axios');

const app = express();
app.use(express.json());

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});

let currentTrack = null;
let lastPlayedTrack = null;
let lastPlayedImage = null;
let lastGeneratedImage = null;

async function getAccessToken() {
  try {
    const data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body['access_token']);
    console.log('Successfully retrieved access token');
  } catch (error) {
    console.error('Error getting Spotify access token:', error);
  }
}

getAccessToken();
setInterval(getAccessToken, 50 * 60 * 1000);

function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

async function generateImage(track) {
  try {
    const background = sharp(path.join(__dirname, 'background.png'));

    console.log('Fetching album art from URL:', track.album_art);

    let albumArtBuffer;
    try {
      const response = await axios.get(track.album_art, { responseType: 'arraybuffer' });
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
    const truncatedArtist = truncateText(track.artist, 36);

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

app.post('/update-track', async (req, res) => {
  if (!currentTrack || currentTrack.name !== req.body.name) {
    lastPlayedTrack = currentTrack;
    if (lastPlayedTrack) {
      try {
        lastPlayedImage = await generateImage(lastPlayedTrack);
        console.log('Generated last played image');
      } catch (error) {
        console.error('Error generating last played image:', error);
        lastPlayedImage = null;
      }
    }
    currentTrack = req.body;
    console.log('Received track update:', currentTrack);
    
    // Generate image for the new current track immediately
    try {
      lastGeneratedImage = await generateImage(currentTrack);
      console.log('Generated image for new current track');
    } catch (error) {
      console.error('Error generating image for new current track:', error);
    }
  }
  res.status(200).send('Track updated');
});

app.get('/now-playing', async (req, res) => {
  let imageToSend;
  let trackInfo;

  if (currentTrack) {
    trackInfo = currentTrack;
    imageToSend = lastGeneratedImage;
    if (!imageToSend) {
      try {
        console.log('Generating image for current track:', currentTrack.name);
        imageToSend = await generateImage(currentTrack);
        lastGeneratedImage = imageToSend;
      } catch (error) {
        console.error('Error generating image for current track:', error);
      }
    }
  } else if (lastPlayedTrack) {
    trackInfo = lastPlayedTrack;
    imageToSend = lastPlayedImage || lastGeneratedImage;
  }

  if (imageToSend) {
    console.log('Sending image, size:', imageToSend.length, 'bytes');
    res.set('Content-Type', 'image/png');
    res.set('Cache-Control', 'public, max-age=480'); // Cache for 5 minutes
    res.send(imageToSend);
  } else {
    console.log('No image available, sending default');
    res.sendFile(path.join(__dirname, 'default.png')); // Ensure you have a default.png
  }
});

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
