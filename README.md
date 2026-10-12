# ChatBotBackend

A Node.js backend for a chatbot application, built using Express.js and MongoDB. The project provides a REST API for handling chat requests, with Google Generative AI included as a dependency for AI-powered functionality.

## Tech Stack

- **Node.js** — JavaScript runtime
- **Express.js** — Backend framework and API routing
- **MongoDB** — Database, accessed through Mongoose
- **Google Generative AI** — AI integration dependency
- **Axios** — HTTP requests to external services

## Features

- REST API built with Express.js
- Dedicated chat API routes
- MongoDB database connection
- JSON request handling
- Health-check endpoint to verify server availability
- Modular backend structure

## Project Structure

```text
ChatBotBackend/
├── src/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   └── routes/
│       └── chatRoutes.js
├── app.js
├── server.js
├── package.json
└── .gitignore
```

*Note: The directory structure above is illustrative; verify the actual contents of each folder in the repository.*

## Getting Started

### Prerequisites

- Node.js with support for the project's configured runtime features
- MongoDB instance or connection URI
- Google Generative AI credentials if required by the implemented chat functionality

### Installation

Clone the repository:

```bash
git clone https://github.com/rsynkr/ChatBotBackend.git
cd ChatBotBackend
```

Install dependencies:

```bash
npm install
```

### Configuration

Create a `.env` file in the project root and configure the environment variables required by the database and AI integration.

```env
MONGODB_URI=your_mongodb_connection_string
GOOGLE_API_KEY=your_google_ai_api_key
```

Use the exact variable names expected by the source code. Never commit API keys or database credentials to GitHub.

### Run the Server

```bash
npm run dev
```

The development script starts the Node.js server with file-watching enabled.

By default, the server listens on port `3000`.

## API

### Health Check

**Endpoint:** `GET /`

Returns a simple message indicating that the API is running.

### Chat

**Endpoint:** `/api/chat`

The chat functionality is mounted under this route. Refer to the chat route and controller implementations for supported HTTP methods, request payloads, and response formats.

## License

This project currently declares the ISC license in `package.json`. Refer to the repository's licensing files for the applicable terms.
