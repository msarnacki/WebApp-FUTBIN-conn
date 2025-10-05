# WebApp-FUTBIN-conn

A Chrome extension that enhances FIFA WebApp trading by analyzing price data from Futbin.com.
Created with use of Kiro - vibecoded

## Description

WebApp-FUTBIN-conn is a Chrome extension that automatically fetches and analyzes FIFA card pricing data from Futbin. The extension integrates with FIFA WebApp and allows for quick analysis of average selling prices for selected players.

## Features

- **Automatic player detection** - scans FIFA WebApp pages and detects available players
- **Futbin data analysis** - fetches sales data from Futbin.com and calculates average prices
- **Sales type breakdown**:
  - Auctions (Bid) - average price and count of cards sold through bidding
  - Buy Now - average price and count of cards sold through instant purchase
- **Data visualization** - simple SVG charts with pricing data
- **Side panel** - all features accessible through a convenient Chrome side panel

## Installation

### Requirements
- Google Chrome (version 88+)
- Access to FIFA WebApp (ea.com)

### Installation Steps

1. **Download the project**
   ```
   git clone [REPOSITORY_URL]
   cd futbin-helper-v2
   ```

2. **Prepare icons** (optional)
   - Place PNG icons in the `icons/` folder:
     - `icon16.png` (16x16px)
     - `icon32.png` (32x32px) 
     - `icon48.png` (48x48px)

3. **Install in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right corner
   - Click "Load unpacked"
   - Select the project folder
   - The extension will be installed

## Usage

### Step 1: Setup
1. Log into FIFA WebApp (ea.com)
2. Navigate to the Transfer Market section
3. Search for cards you're interested in

### Step 2: Analysis
1. Click the FUTBIN Helper v2 icon in Chrome's toolbar
2. Open the extension's side panel
3. Click "Refresh player list" to detect available players
4. Select a player and click "Analyze"

### Step 3: Interpreting Results
The extension will display:
- **Price chart** - visualization of pricing trends
- **Auction data** - average price and count of cards sold through bidding
- **Buy Now data** - average price and count of cards sold through instant purchase

## Project Structure

```
futbin-helper-v2/
├── manifest.json          # Chrome extension manifest
├── background.js          # Service worker (main logic)
├── content.js            # Content script (FIFA WebApp integration)
├── sidepanel.html        # Side panel interface
├── sidepanel.css         # Side panel styles
├── sidepanel.js          # Side panel logic
├── popup.html            # Fallback popup (for older Chrome versions)
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon32.png
│   └── icon48.png
├── INSTRUKCJA.md         # Detailed instructions (Polish)
└── README.md             # This file
```

## Configuration

### Adding New Players

To add new players to the dictionary:

1. Open the `background.js` file
2. Find the `cardDictionary` object
3. Add a new card in the format:
   ```javascript
   "Player Name": "id/player-name-url"
   ```

Example:
```javascript
const cardDictionary = {
  "Xabi Alonso": "18792/xabi-alonso",
  "Lionel Messi": "158023/lionel-messi"
};
```

### Futbin URL Format
Futbin URLs follow the format: `https://www.futbin.com/26/sales/{id}/{name}?platform=pc`

Where:
- `{id}` - numeric player ID in Futbin
- `{name}` - player name in URL format (lowercase, hyphens instead of spaces)

## Troubleshooting

### Extension doesn't detect players
- Check if you're on the ea.com website
- Refresh the FIFA WebApp page (F5)
- Make sure players are visible on the page

### Error fetching data from Futbin
- Check your internet connection
- Ensure Futbin.com is accessible
- Verify the player exists in the dictionary

### Extension not working
- Check if the extension is enabled in `chrome://extensions/`
- Reload the extension in extension settings
- Check the developer console (F12) for errors

## Permissions

The extension requires the following permissions:
- `activeTab` - access to the active tab
- `storage` - storing settings
- `scripting` - script injection
- `sidePanel` - side panel functionality
- `tabs` - tab management
- `debugger` - advanced data fetching

Domains:
- `https://www.ea.com/*` - FIFA WebApp
- `https://www.futbin.com/*` - pricing data

## Technologies

- **JavaScript ES6+** - application logic
- **Chrome Extensions API v3** - browser integration
- **HTML5/CSS3** - user interface
- **SVG** - chart visualization

## License

This project is available under the MIT License.

## Author

FUTBIN Helper v2 - Chrome extension for the FIFA community

## Support

If you encounter issues:
1. Check the "Troubleshooting" section
2. Check the developer console (F12)
3. Reload the extension in chrome://extensions/

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Disclaimer

This extension is an independent project and is not officially affiliated with EA Sports or Futbin.com.

---

**Note**: This extension is designed to help FIFA players make informed trading decisions by providing easy access to market data.