import os
import sys
import time
import requests
from dotenv import load_dotenv
import spotipy
from spotipy.oauth2 import SpotifyOAuth
import threading
import pystray
from PIL import Image
import logging

logging.basicConfig(filename='spotify_now_playing.log', level=logging.DEBUG,
                    format='%(asctime)s - %(levelname)s - %(message)s')

load_dotenv()

client_id = os.getenv('SPOTIPY_CLIENT_ID')
client_secret = os.getenv('SPOTIPY_CLIENT_SECRET')
redirect_uri = os.getenv('SPOTIPY_REDIRECT_URI')
refresh_token = os.getenv('SPOTIFY_REFRESH_TOKEN')

render_server_url = os.getenv('RENDER_SERVER_URL')

sp_oauth = SpotifyOAuth(client_id=client_id,
                        client_secret=client_secret,
                        redirect_uri=redirect_uri,
                        scope="user-read-currently-playing")

def get_token():
    try:
        token_info = sp_oauth.refresh_access_token(refresh_token)
        return token_info['access_token']
    except spotipy.oauth2.SpotifyOauthError as e:
        logging.error(f"Error refreshing token: {e}")
        sys.exit(1)

sp = spotipy.Spotify(auth=get_token())

def get_current_content():
    try:
        current_playback = sp.current_user_playing_track()
        if current_playback is not None and current_playback['is_playing']:
            item = current_playback['item']
            content_type = current_playback['currently_playing_type']
            
            if content_type == 'track':
                content_info = {
                    'type': 'track',
                    'name': item['name'],
                    'artist': item['artists'][0]['name'],
                    'album': item['album']['name'],
                    'album_art': item['album']['images'][0]['url'] if item['album']['images'] else None
                }
            elif content_type == 'episode':
                content_info = {
                    'type': 'episode',
                    'name': item['name'],
                    'show': item['show']['name'],
                    'description': item['description'],
                    'image': item['images'][0]['url'] if item['images'] else None
                }
            else:
                content_info = {
                    'type': 'unknown',
                    'name': 'Unknown Content',
                    'description': f'Unhandled content type: {content_type}'
                }
            
            return content_info
        return None
    except spotipy.exceptions.SpotifyException as e:
        if e.http_status == 401:
            logging.info("Access token expired. Refreshing...")
            sp.set_auth(get_token())
            return get_current_content()
        logging.error(f"Error getting current content: {e}")
        return None

def update_content_on_server(content_info):
    try:
        response = requests.post(render_server_url, json=content_info)
        if response.status_code == 200:
            logging.info("Content information updated successfully")
        else:
            logging.error(f"Failed to update content information. Status code: {response.status_code}")
    except Exception as e:
        logging.error(f"Error updating content on server: {e}")

def server_loop():
    logging.info("Starting Spotify content updater...")
    last_content = None
    last_update_time = time.time()
    while not stop_event.is_set():
        current_content = get_current_content()
        current_time = time.time()
        if current_content:
            if current_content != last_content:
                logging.info(f"New content: {current_content['name']}")
                update_content_on_server(current_content)
                last_content = current_content
                last_update_time = current_time
            elif (current_time - last_update_time) > 100:
                logging.info("No updates for 8 minutes. Resending last content info.")
                update_content_on_server(last_content)
                last_update_time = current_time
        time.sleep(10)
    logging.info("Server loop stopped")

def on_quit(icon, item):
    logging.info("Quit requested")
    stop_event.set()
    icon.stop()

def run_tray():
    image = Image.new('RGB', (64, 64), color = (73, 109, 137))
    menu = pystray.Menu(pystray.MenuItem("Quit", on_quit))
    icon = pystray.Icon("Spotify Now Playing", image, "Spotify Now Playing", menu)
    icon.run()
    logging.info("Tray icon stopped")

if __name__ == "__main__":
    logging.info("Starting Spotify Now Playing application")

    stop_event = threading.Event()

    server_thread = threading.Thread(target=server_loop)
    server_thread.start()

    run_tray()

    server_thread.join()

    logging.info("Application stopped")
