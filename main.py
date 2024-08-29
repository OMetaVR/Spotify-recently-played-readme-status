import os
import sys
import subprocess
import webbrowser
from dotenv import load_dotenv
import spotipy
from spotipy.oauth2 import SpotifyOAuth

def check_and_refresh_token():
    load_dotenv()
    client_id = os.getenv('SPOTIPY_CLIENT_ID')
    client_secret = os.getenv('SPOTIPY_CLIENT_SECRET')
    redirect_uri = os.getenv('SPOTIPY_REDIRECT_URI')
    refresh_token = os.getenv('SPOTIFY_REFRESH_TOKEN')

    if not all([client_id, client_secret, redirect_uri]):
        print("Error: Missing Spotify API credentials in .env file.")
        return False

    sp_oauth = SpotifyOAuth(client_id=client_id,
                            client_secret=client_secret,
                            redirect_uri=redirect_uri,
                            scope="user-read-currently-playing")

    if not refresh_token:
        print("No refresh token found. Starting authentication process...")
        auth_url = sp_oauth.get_authorize_url()
        webbrowser.open(auth_url)
        response = input("Enter the URL you were redirected to: ")
        code = sp_oauth.parse_response_code(response)
        token_info = sp_oauth.get_access_token(code)
        refresh_token = token_info['refresh_token']
        
        with open('.env', 'a') as env_file:
            env_file.write(f"\nSPOTIFY_REFRESH_TOKEN={refresh_token}\n")
        print("Refresh token has been added to .env file.")
    
    try:
        sp_oauth.refresh_access_token(refresh_token)
        print("Token refreshed successfully.")
        return True
    except:
        print("Failed to refresh token. Please re-authenticate.")
        return False

def start_server():
    subprocess.Popen([sys.executable, 'server.pyw'], 
                     creationflags=subprocess.CREATE_NO_WINDOW)

def start_tray_controller():
    subprocess.Popen([sys.executable, 'tray_controller.pyw'], 
                     creationflags=subprocess.CREATE_NO_WINDOW)

def main():
    if check_and_refresh_token():
        start_server()
        print("Server started successfully.")
        start_tray_controller()
        print("Tray controller started. Check your system tray for the icon.")
        input("Press Enter to exit...")
    else:
        print("Failed to start the server due to authentication issues.")
        input("Press Enter to exit...")

if __name__ == "__main__":
    main()