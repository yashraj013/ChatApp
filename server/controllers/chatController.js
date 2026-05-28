import mongoose from "mongoose";
import Session from "../models/sessionModel.js";
import Message from "../models/messageModel.js";

const generateAssistantReply = async (userText) => {
  // Placeholder until llmService is implemented
  return `You said: ${userText}`;
};

export const createSession = async (req, res) => {
  try {
    const { title } = req.body;

    const session = await Session.create({
      userId: req.userId,
      title: title?.trim() || "New Chat",
    });

    return res.status(201).json({
      message: "Session created",
      sessionId: session._id,
      session,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create session",
      error: error.message,
    });
  }
};

export const listSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.userId }).sort({
      updatedAt: -1,
    });

    return res.status(200).json({ sessions });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to list sessions",
      error: error.message,
    });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { id: sessionId } = req.params;
    const { content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({
        message: "Invalid session id",
      });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({
        message: "Message content is required",
      });
    }

    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    if (session.userId.toString() !== req.userId) {
      return res.status(403).json({
        message: "Forbidden: this session does not belong to you",
      });
    }

    const userMessage = await Message.create({
      sessionId,
      role: "user",
      content: content.trim(),
    });

    const assistantText = await generateAssistantReply(content.trim());

    const assistantMessage = await Message.create({
      sessionId,
      role: "assistant",
      content: assistantText,
    });

    // Update session ordering for sidebar
    session.updatedAt = new Date();
    await session.save();

    return res.status(201).json({
      userMessage,
      assistantMessage,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to send message",
      error: error.message,
    });
  }
};

export const getSessionMessages = async (req, res) => {
  try {
    const { id: sessionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({
        message: "Invalid session id",
      });
    }

    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        message: "Session not found",
      });
    }

    if (session.userId.toString() !== req.userId) {
      return res.status(403).json({
        message: "Forbidden: this session does not belong to you",
      });
    }

    const messages = await Message.find({ sessionId }).sort({ createdAt: 1 });

    return res.status(200).json({
      sessionId,
      messages,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to load messages",
      error: error.message,
    });
  }
};