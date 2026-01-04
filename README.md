# New Year Resolutions Tracker

A beautiful, modern web page to track and share your New Year resolutions. Hosted on GitHub Pages with data stored in CSV files.

## Features

- 🎨 Modern, appealing design with gradient backgrounds
- 📊 Progress tracking with visual progress bars
- 📱 Responsive design that works on all devices
- 📝 Easy to update - just edit the CSV file
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

## Updating Your Resolutions

Simply edit the `resolutions.csv` file with your resolutions. The CSV file should have the following columns:

- `title` - The name of your resolution
- `description` - A brief description (optional)
- `status` - One of: `not-started`, `in-progress`, or `completed`
- `category` - A category tag (optional, e.g., "Health", "Learning", "Travel")

### CSV Format Example

```csv
title,description,status,category
Learn Python,Master Python programming,in-progress,Learning
Exercise regularly,Go to gym 3x per week,not-started,Health
Read 24 books,2 books per month,not-started,Learning
```

After editing the CSV file:
1. Commit your changes
2. Push to GitHub
3. Your page will automatically update (may take a few minutes)

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
├── .nojekyll          # GitHub Pages configuration
└── README.md          # This file
```

## Browser Support

Works in all modern browsers that support:
- ES6 JavaScript
- CSS Grid
- Fetch API

## License

Feel free to use this project for your own resolutions tracker!
