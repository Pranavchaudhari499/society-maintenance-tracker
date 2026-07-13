import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { chatWithBot } from "../controllers/chatbotController";

const router = Router();

// Only authenticated users can access the chatbot
router.post("/", authenticate, chatWithBot);

export default router;
