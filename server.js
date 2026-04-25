import express from "express";
import chatRoutes from "./src/routes/chatRoutes.js";
import { connectDB } from "./src/config/db.js";

const app = express();
const PORT = 3000;

app.use(express.json());
connectDB();

// Health check
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Routes
app.use('/api/chat', chatRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});