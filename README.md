# EVU-WEB

Official website for EVU FiveM QBCore Server

## Features

This website provides a complete online presence for the EVU FiveM roleplay server with the following pages:

### 🏠 Status Page (`index.html`)
- Real-time server status indicator
- Current player count
- Server uptime statistics
- QBCore version information
- Server features showcase

### 🎮 Join Page (`join.html`)
- Direct connect information
- Step-by-step connection guide
- System requirements
- Prerequisites checklist
- Discord community link

### 💬 Forum Page (`forum.html`)
- Multiple forum categories
- Recent activity feed
- Community discussion areas
- Forum rules and guidelines

### 📋 Changelog Page (`changelog.html`)
- Complete version history
- Organized by features, improvements, and bug fixes
- Release dates and version tracking

## Deployment

This is a static website that can be hosted on any web server or static hosting service:

- **GitHub Pages**: Enable GitHub Pages in repository settings
- **Netlify**: Connect repository and deploy
- **Vercel**: Import project and deploy
- **Any Web Server**: Upload files to your web server

To test locally:
```bash
# Using Python
python3 -m http.server 8000

# Using Node.js
npx http-server

# Using PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## Customization

### Update Server Information
- Edit server IP/connection info in `join.html`
- Update server stats in `status.js`
- Modify changelog entries in `changelog.html`
- Customize forum categories in `forum.html`

### Styling
- All styles are in `style.css`
- Color scheme variables are defined in `:root`
- Fully responsive design included

### Server Status API
To connect to your actual FiveM server API, uncomment and modify the `fetchRealServerStatus()` function in `status.js`.

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## License

© 2024 EVU Server. All rights reserved.