# Baby Care Tracker

A web application for tracking baby care activities including feeding, diaper changes, and more.

## Features

- Track feeding (formula and breastfeeding)
- Track diaper changes
- Date-based navigation
- Timezone support (PST)
- Responsive design
- Real-time updates
- Theme Support:
  - Dark mode (default)
  - Light mode
  - Persistent theme preference
  - Smooth theme transitions

## Recent Updates

### Theme System (Latest)
- Added comprehensive theme support with dark and light modes
- Implemented smooth color transitions for all UI elements
- Added theme persistence using localStorage
- Improved theme switcher UI with animations
- Added responsive design for theme controls

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: MongoDB
- Additional Libraries: 
  - Moment.js (time handling)
  - Winston (logging)
  - Font Awesome (icons)

## Installation

1. Clone the repository:
```bash
git clone [your-repository-url]
cd baby-care
```

2. Install dependencies:
```bash
cd backend
npm install
```

3. Create a `.env` file in the backend directory with the following variables:
```
PORT=5001
MONGODB_URI=mongodb://localhost:27017/baby_care
TIMEZONE=America/Los_Angeles
NODE_ENV=development
```

4. Start the server:
```bash
npm start
```

## Usage

Access the application through your web browser at `http://localhost:5001`

### Theme Switching
- Click the theme toggle button at the bottom of the sidebar
- Theme preference is automatically saved
- Transitions smoothly between dark and light modes

## Development

To run the application in development mode with auto-reload:
```bash
npm run dev
```

## Testing

Run the test suite:
```bash
npm test
```

## License

MIT License 