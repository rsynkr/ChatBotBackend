const express = require('express');
const cors = require('cors');

const chatRoutes = require('./routes/chatRoutes');
const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/chat', chatRoutes);

// Health check
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Error handler (always last)
app.use(errorMiddleware);

module.exports = app;