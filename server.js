import express from "express";
import chatRoutes from "./src/routes/chatRoutes.js";
import { connectDB } from "./src/config/db.js";
import cors from "cors";

const app = express();
const PORT = 8000;

// 🔥 Middlewares
app.use(cors());
app.use(express.json());

// 🔥 Health check
app.get("/", (req, res) => {
  res.send("API is running...");
});

// 🔥 Routes
app.use("/api", chatRoutes);

// 🔥 START SERVER ONLY AFTER DB CONNECTS
const startServer = async () => {
  try {
    await connectDB(); // ✅ wait for DB

    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error("Failed to connect DB:", err);
    process.exit(1);
  }
};

startServer();