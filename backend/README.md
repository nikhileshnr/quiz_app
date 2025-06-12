# AI Quiz App

An AI-powered quiz application that can generate quizzes using Gemini AI API or manually create them.

## Project Structure

```
quiz_app/
├── src/
│   ├── controllers/    # Request handlers
│   ├── models/         # Data models
│   ├── routes/         # API routes
│   ├── middleware/     # Custom middleware
│   ├── services/       # Business logic
│   ├── config/         # Configuration files
│   └── utils/          # Utility functions
├── .env                # Environment variables (not in repo)
├── .env.example        # Example environment variables
├── package.json        # Project dependencies
└── README.md           # Project documentation
```

## Features

- Manual quiz creation with single and multiple-choice questions
- AI-powered quiz generation using Gemini API
- CRUD operations for quizzes
- Input validation
- Error handling

## Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and update with your configurations
3. Install dependencies: `npm install`
4. Start the development server: `npm run dev`

## API Endpoints

- `GET /api/quiz` - Get all quizzes
- `GET /api/quiz/:id` - Get a specific quiz
- `POST /api/quiz/manual` - Create a quiz manually
- `POST /api/quiz/ai` - Generate a quiz using AI
- `PUT /api/quiz/:id` - Update a quiz
- `DELETE /api/quiz/:id` - Delete a quiz

## Technologies

- Node.js
- Express
- MongoDB (planned)
- Gemini AI API (planned)
