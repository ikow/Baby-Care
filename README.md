# Baby Care Tracker

A web application for tracking baby care activities including feeding, diaper changes, and more.

## Features

- Track feeding (formula and breastfeeding)
- Track diaper changes
- Date-based navigation
- Timezone support (PST)
- Responsive design
- Real-time updates

## Tech Stack

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js, Express
- Database: MongoDB
- Additional Libraries: Moment.js, Winston (logging)

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