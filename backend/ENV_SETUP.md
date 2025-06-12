# Environment Variables Setup

This application uses environment variables for configuration. To set up your environment:

1. Create a `.env` file in the root directory of the project
2. Add the following variables to your `.env` file:

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/quiz_app

# API Keys
GEMINI_API_KEY=your_gemini_api_key_here
```

## Notes

- `PORT`: The port number for the server to listen on (default: 5000)
- `NODE_ENV`: The environment mode: 'development', 'production', or 'test'
- `MONGO_URI`: MongoDB connection string
- `GEMINI_API_KEY`: Your API key for the Gemini AI service (required for AI quiz generation)

## Getting a Gemini API Key

To obtain a Gemini API key:
1. Visit [AI Studio](https://aistudio.google.com/)
2. Create an account if you don't have one
3. Navigate to the API keys section
4. Generate a new API key
5. Copy the key to your `.env` file

## Environment Fallbacks

If no `.env` file is found, the application will use default values:
- PORT=5000
- NODE_ENV=development
- MONGO_URI=mongodb://localhost:27017/quiz_app
- GEMINI_API_KEY="" (empty string) 