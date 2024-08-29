<div align="center">
  <img width="600" src="images/banner.png" alt="Spotify Now Playing Logo">

An open-source, cross-platform Spotify Now Playing display<br />
compatible with Windows, macOS, and Linux, utilizing Spotify's API<br />
to show your currently playing track in real-time

<a href="https://github.com/OMetaVR/Spotify-recently-played-readme-status/stargazers"><img src="https://img.shields.io/github/stars/OMetaVR/Spotify-recently-played-readme-status?style=flat-square" alt="GitHub Repo stars"></a>
<a href="https://github.com/OMetaVR/Spotify-recently-played-readme-status/issues"><img src="https://img.shields.io/github/issues/OMetaVR/Spotify-recently-played-readme-status?style=flat-square" alt="GitHub issues"></a>
<a href="https://github.com/OMetaVR/Spotify-recently-played-readme-status/LICENSE"><img src="https://img.shields.io/github/license/OMetaVR/Spotify-recently-played-readme-status?style=flat-square" alt="GitHub License"></a>

---

![Spotify Now Playing Desktop](images/screenshot.png)

</div>

## 🌟 Features

- 🎵 Real-time display of currently playing Spotify track
- 🖼️ Album artwork display
- 👨‍💻 Cross-platform support (Windows, macOS, Linux)
- 🚀 Lightweight and efficient
- 🔒 Secure authentication with Spotify API
- 🎨 Customizable display options
- 🔄 Automatic updates of track information

## 📥 Installation Guide

### Prerequisites

- Python 3.7 or higher
- pip (Python package installer)
- A Spotify Developer account
- Node.js and npm (for server deployment)

### Step 1: Clone the Repository

```bash
git clone https://github.com/OMetaVR/Spotify-recently-played-readme-status.git
cd Spotify-recently-played-readme-status
```

### Step 2: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 3: Set Up Spotify Developer Application

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard/)
2. Log in with your Spotify account
3. Click "Create an App"
4. Fill in the app name and description
5. Once created, click "Edit Settings"
6. Add `http://localhost:8888/callback` to the Redirect URIs and save

### Step 4: Configure Environment Variables

Create a `.env` file in the root directory of the project and add the following:

```
SPOTIPY_CLIENT_ID=your_client_id
SPOTIPY_CLIENT_SECRET=your_client_secret
SPOTIPY_REDIRECT_URI=http://localhost:8888/callback
```

Replace `your_client_id` and `your_client_secret` with the values from your Spotify Developer Application.

### Step 5: Deploy the Server

1. Sign up for an account on [Render](https://render.com/) or a similar hosting service
2. Create a new Web Service and connect it to your GitHub repository
3. Set the following:
   - Build Command: `npm install`
   - Start Command: `node server.js`
4. Add the environment variables from your `.env` file to the hosting service's environment variables section
5. Deploy the server and note down the URL provided by the hosting service

### Step 6: Update Local Configuration

Add the following line to your `.env` file, replacing `your-render-url` with the URL from Step 5:

```
RENDER_SERVER_URL=https://your-render-url.onrender.com/update-track
```

### Step 7: Run the Application

```bash
python main.py
```

The first time you run the application, it will open a web browser for authentication. Log in with your Spotify account and grant the necessary permissions.

### Step 8: Access the Now Playing Display

Once the application is running and the server is deployed, you can access your Now Playing display at:

```
https://your-render-url.onrender.com/now-playing
```

This URL will display an image of your currently playing track, which you can embed in other applications or websites.

### Troubleshooting

If you encounter any issues during installation or setup, please check the following:

- Ensure all environment variables are correctly set in both the `.env` file and your hosting service
- Check that your Spotify Developer Application settings are correct
- Make sure you're using compatible versions of Python and Node.js
- Verify that your server is successfully deployed and running

For more detailed troubleshooting, please refer to the [Issues](https://github.com/OMetaVR/Spotify-recently-played-readme-status/issues) section of the repository.

## 🛠️ Configuration

You can customize the display by right-clicking on the app and selecting "Settings". Options include:

- Display size
- Color scheme
- Information to display (artist, album, track progress, etc.)
- Behavior when no track is playing

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/yourAmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/yourAmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the Unlicensed License. See the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Spotify API](https://developer.spotify.com/documentation/web-api)
- [Flutter](https://flutter.dev) for the cross-platform framework
- [spotipy](https://github.com/plamere/spotipy) for Python Spotify API wrapper
