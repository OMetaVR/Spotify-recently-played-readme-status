import spotipy
from spotipy.oauth2 import SpotifyOAuth
from dotenv import load_dotenv
import os

load_dotenv()

client_id = os.getenv('SPOTIPY_CLIENT_ID')
client_secret = os.getenv('SPOTIPY_CLIENT_SECRET')
redirect_uri = os.getenv('SPOTIPY_REDIRECT_URI')

sp_oauth = SpotifyOAuth(client_id=client_id,
                        client_secret=client_secret,
                        redirect_uri=redirect_uri,
                        scope="user-read-currently-playing")

print("Please visit this URL to authorize your application:")
print(sp_oauth.get_authorize_url())
response = input("Enter the URL you were redirected to: ")

code = sp_oauth.parse_response_code(response)
token_info = sp_oauth.get_access_token(code)

print(f"\nYour refresh token is: {token_info['refresh_token']}")
print("\nAdd this line to your .env file:")
print(f"SPOTIFY_REFRESH_TOKEN={token_info['refresh_token']}")

# Automatically append the refresh token to the .env file
with open('.env', 'a') as env_file:
    env_file.write(f"\n# Spotify Refresh Token\nSPOTIFY_REFRESH_TOKEN={token_info['refresh_token']}\n")

print("\nThe refresh token has been automatically added to your .env file.")