import Message from "../models/messageModel.js";

export const loadRecentMessages = async (sessionId, limit = 20) => {
  const history = await Message.find({ sessionId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return history
    .reverse()
    .map((message) => ({
      role: message.role,
      content: message.content,
    }));
};