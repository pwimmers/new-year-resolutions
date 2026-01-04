# New Year Resolutions Tracker

A beautiful, modern web page to track and share your New Year resolutions. Hosted on GitHub Pages with data stored in CSV files.

## Features

- 🎨 Modern, appealing design with gradient backgrounds
- 📊 Progress tracking with visual progress bars
- 🏃 Featured goal tracking with detailed progress (e.g., running distance)
- 📱 Responsive design that works on all devices
- 📝 Easy to update - just edit the CSV files
- 🚀 No hosting required - works with GitHub Pages

## Setup

1. **Fork or clone this repository**

2. **Enable GitHub Pages**
   - Go to your repository settings
   - Navigate to "Pages" in the left sidebar
   - Under "Source", select your main branch (usually `main` or `master`)
   - Click "Save"

3. **Your page will be available at:**
   ```
   https://[your-username].github.io/new-year-resolutions/
   ```

## Local Development

**Important:** You cannot open `index.html` directly in a browser due to browser security restrictions. You need to run a local web server.

### Option 1: Python (Recommended)
```bash
cd new-year-resolutions
python3 -m http.server 8000
```
Then open: http://localhost:8000

### Option 2: Node.js
```bash
cd new-year-resolutions
npx http-server -p 8000
```

### Option 3: PHP
```bash
cd new-year-resolutions
php -S localhost:8000
```

## Updating Your Resolutions

Simply edit the `resolutions.csv` file with your resolutions. The CSV file should have the following columns:

- `title` - The name of your resolution
- `description` - A brief description (optional)
- `status` - One of: `not-started`, `in-progress`, or `completed`
- `category` - A category tag (optional, e.g., "Health", "Learning", "Travel")
- `current` - Your current personal record or starting value (optional)
- `target` - Your target goal to beat (optional)
- `link` - URL to competition result or Strava/Garmin activity (optional)

### CSV Format Example

```csv
title,description,status,category,current,target,link
Learn Python,Master Python programming,in-progress,Learning,,,
Marathon < 4,Run a marathon below 4 hours,in-progress,Running,4:15,4:00,
Half-Marathon < 1:45,Run a half-marathon below 1:45,not-started,Running,1:51:57,1:45,https://www.strava.com/activities/123456
```

After editing the CSV file:
1. Commit your changes
2. Push to GitHub
3. Your page will automatically update (may take a few minutes)

## Tracking Running Goals

The page includes a special featured card for tracking running distance goals. This card appears at the top and shows:
- Total distance run (from `runs.csv`)
- Expected distance based on day of year
- How far ahead or behind you are
- Visual comparison bars

### Running Data Format

Create a `runs.csv` file with your running data:

```csv
date,distance
2026-01-02,5.2
2026-01-05,8.5
2026-01-08,6.0
```

- `date` - Date of the run (YYYY-MM-DD format)
- `distance` - Distance in kilometers

The system automatically calculates:
- Expected distance: `(day of year / 365) × 2000 km`
- Your progress vs. expected progress
- Percentage of goal completed

**Note:** The running goal is currently set to 2000km for 2026. To change the target, edit the `targetKm` parameter in the `calculateRunningProgress` function in `script.js`.

## Tracking Gym Goals

The page includes a featured card for tracking gym attendance. This card shows:
- Number of weeks with at least one gym visit
- Number of weeks missed
- Average visits per week
- Total visits
- Weekly attendance progress

### Gym Data Format

Create a `gym.csv` file with your gym visit dates:

```csv
date
2026-01-05
2026-01-12
2026-01-19
```

- `date` - Date of the gym visit (YYYY-MM-DD format)

The system automatically calculates weekly statistics based on your goal of going to the gym at least once per week.

## Customization

### Colors and Styling
Edit `styles.css` to customize colors, fonts, and layout. The CSS uses CSS variables for easy customization:

```css
:root {
    --primary-color: #6366f1;
    --secondary-color: #8b5cf6;
    /* ... more variables */
}
```

### Adding More Fields
To add more fields to your resolutions:
1. Add the column to your CSV file
2. Update `script.js` to display the new field in the `createResolutionCard` function

## File Structure

```
new-year-resolutions/
├── index.html          # Main HTML page
├── styles.css          # Styling
├── script.js           # CSV parsing and display logic
├── resolutions.csv     # Your resolutions data
├── runs.csv            # Running data (optional, for featured goal)
├── gym.csv             # Gym visit dates (optional, for featured goal)
├── .nojekyll          # GitHub Pages configuration
└── README.md          # This file
```

## Browser Support

Works in all modern browsers that support:
- ES6 JavaScript
- CSS Grid
- Fetch API

## About This Project

This project is also an experiment for me to play with [Cursor](https://cursor.sh/) and gain experience with AI agent development. The entire codebase was developed using Cursor's AI assistant, which helped with everything from initial setup to feature implementation and styling. It's been a great learning experience exploring how AI agents can assist in web development workflows.

## License

Feel free to use this project for your own resolutions tracker!
