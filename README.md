<div align="center">
  <img width="600" src="images/banner.png" alt="Spotify Now Playing Logo">

A lightweight Node.js server that generates a dynamic image of your currently playing Spotify track,<br />
perfect for embedding in GitHub READMEs, websites, or anywhere that accepts image URLs.

<a href="https://github.com/OMetaVR/ReadMe-RPCs/stargazers"><img src="https://img.shields.io/github/stars/OMetaVR/ReadMe-RPCs?style=flat-square" alt="GitHub Repo stars"></a>
<a href="https://github.com/OMetaVR/ReadMe-RPCs/issues"><img src="https://img.shields.io/github/issues/OMetaVR/ReadMe-RPCs?style=flat-square" alt="GitHub issues"></a>
<a href="https://github.com/OMetaVR/ReadMe-RPCs/LICENSE"><img src="https://img.shields.io/github/license/OMetaVR/ReadMe-RPCs?style=flat-square" alt="GitHub License"></a>

---

</div>

## 🌟 Features

- 🎵 Real-time display of currently playing Spotify track
- 🖼️ Beautiful album artwork with rounded corners
- 🔄 Automatic fallback to recently played track when nothing is playing
- 🚀 Lightweight Node.js server
- 🔒 Secure authentication with Spotify API
- 💫 Cache-busting headers for always-fresh images
- 🎨 Clean, modern design

## 📥 Installation Guide

### Prerequisites

- Node.js 18 or higher
- npm (Node.js package manager)
- A Spotify Developer account

### Step 1: Clone the Repository

```bash
git clone https://github.com/OMetaVR/ReadMe-RPCs.git
cd spotify-done-right
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Set Up Spotify Developer Application

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)
2. Log in with your Spotify account
3. Click "Create an App"
4. Fill in the app name and description
5. Once created, click "Settings"
6. Add `http://localhost:3000/callback` to the Redirect URIs and save

### Step 4: Get Your Refresh Token

1. Create a `.env` file in the root directory with your Spotify credentials:
```env
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
PORT=3002
```

2. Run the token generator:
```bash
node get-refresh-token.js
```

3. Visit http://localhost:3000/login in your browser
4. Authorize the application
5. Copy the refresh token and add it to your `.env` file:
```env
SPOTIFY_REFRESH_TOKEN=your_refresh_token
```

### Step 5: Start the Server

```bash
node src/index.js
```

Your Now Playing image will be available at:
```
http://localhost:3002/nowplaying.png
```

### Step 6: Deploy (Optional)

For 24/7 availability, deploy to a hosting service like:
- [Render](https://render.com)
- [DigitalOcean](https://www.digitalocean.com)
- [Heroku](https://www.heroku.com)

Make sure to:
1. Set all environment variables on your hosting platform
2. Update the image URL in your README/website to point to your deployed server

## 🖼️ Usage in GitHub README

Add this to your README.md (replace the URL with your server's URL):
```markdown
![Spotify Now Playing](http://your-server:3002/nowplaying.png?t={timestamp})
```

Note: The `?t={timestamp}` parameter helps prevent GitHub's image caching. You might want to use a GitHub Action to automatically update this timestamp periodically.

<div></div>

<div align="center">
If all is done correctly you should have something like this, this image is my last song I listened too!

![Spotify Now Playing Example](https://spotify.meternalized.online/nowplaying.png?t=01%2F04%2F2025%203%3A10%20AM)
</div>

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the Unlicensed License. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Spotify Web API](https://developer.spotify.com/documentation/web-api)
- [sharp](https://sharp.pixelplumbing.com) for image processing
- [express](https://expressjs.com) for the web server
