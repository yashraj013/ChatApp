import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { limiterForChat } from "../middleware/rateLimiter.js";
import {
  createSession,
  listSessions,
  sendMessage,
  getSessionMessages,
} from "../controllers/chatController.js";

const router = express.Router();

// Protect all chat routes
router.use(authMiddleware);
router.use(limiterForChat);

router.post("/sessions", createSession);
router.get("/sessions", listSessions);
router.post("/sessions/:id/message", sendMessage);
router.get("/sessions/:id/messages", getSessionMessages);

export default router;