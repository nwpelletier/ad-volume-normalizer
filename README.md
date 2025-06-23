# WhisperAds

Chrome extension that automatically mutes or reduces volume during Twitch ads.

## Features

- Detects when Twitch plays ads
- Auto-mutes or lowers the volume during ads
- Simple toggle to enable/disable behavior (refresh once change is made)
- Remembers your setting using Chrome sync storage

## Installation (Developer Mode)

Since this isn't published yet:

1. Clone or download this repo.
2. Open `chrome://extensions/` in Google Chrome.
3. Enable **Developer mode** (top right toggle).
4. Click **Load unpacked** and select the project folder.
5. Navigate to [twitch.tv](https://www.twitch.tv) and try it out.

## Usage

- Click the extension icon to open the popup.
- Use the toggle switch to turn the feature on or off.
- Setting is saved and applied automatically to Twitch tabs.

## Tech Stack

- JavaScript (vanilla)
- Manifest V3 (Chrome Extensions API)
- HTML & CSS (with animated gradient and subtle grid background)

## Status

🚧 This is a personal side project and is currently under development.  
Expect bugs, unpolished UI, and limited ad-detection coverage.

## License

MIT License
