import express from "express";
import { handleChat, endChat } from "../controller/chatController.js";

const router = express.Router();

router.post("/chat", handleChat);
router.post("/chat/end", endChat);

export default router;