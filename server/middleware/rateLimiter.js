import rateLimit from "express-rate-limit";

export const limiterForAuth = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max 10 requests per window per IP for login/signup
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) =>
    res.status(429).json({ message: "Too many requests, try again later." }),
});

export const limiterForChat = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // max 20 messages per minute per user/IP
  keyGenerator: (req) => req.userId || req.ip, // prefer per-user when authenticated
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) =>
    res.status(429).json({ message: "Too many messages, slow down." }),
});