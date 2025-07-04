# FarmDirect E-commerce Platform

A full-stack e-commerce platform built with modern web technologies.

## Tech Stack

- **Frontend**: React.js
- **Backend**: Node.js with Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Deployment**: Vercel/AWS Cloud
- **Version Control**: Git/GitHub
- **IDE**: Visual Studio Code
- **Design**: UXPilot

## Project Structure

```
farmdirect/
├── client/                 # Frontend React application
├── server/                 # Backend Node.js/Express application
├── prisma/                 # Database schema and migrations
└── docs/                   # Project documentation
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL
- Git

### Database Setup

1. Create a PostgreSQL database named 'farmdirect'
2. Update the DATABASE_URL in .env file with your credentials

### Backend Setup

```bash
cd server
npm install
npm run dev
```

### Frontend Setup

```bash
cd client
npm install
npm start
```

## Environment Variables

Create a `.env` file in the server directory with the following variables:

```
DATABASE_URL="postgresql://username:password@localhost:5432/farmdirect"
JWT_SECRET="your-secret-key"
```

## Development

- Frontend runs on: http://localhost:3000
- Backend runs on: http://localhost:5000

## License

MIT 