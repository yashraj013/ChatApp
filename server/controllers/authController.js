import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  authProvider: user.authProvider,
  googleId: user.googleId,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      authProvider: user.authProvider,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

export const signup = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      authProvider = "local",
      googleId,
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        message: "Name and email are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if the email is already registered
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists with this email",
      });
    }

    if (authProvider === "local") {
      if (!password) {
        return res.status(400).json({
          message: "Password is required for local signup",
        });
      }

      const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password,
        authProvider: "local",
      });

      const token = generateToken(user);

      return res.status(201).json({
        message: "Local signup successful",
        token,
        user: sanitizeUser(user),
      });
    }

    if (authProvider === "google") {
      if (!googleId) {
        return res.status(400).json({
          message: "googleId is required for Google signup",
        });
      }

      const googleUser = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        authProvider: "google",
        googleId,
      });

      const token = generateToken(googleUser);

      return res.status(201).json({
        message: "Google signup successful",
        token,
        user: sanitizeUser(googleUser),
      });
    }

    return res.status(400).json({
      message: "Invalid authProvider. Use 'local' or 'google'",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Signup failed",
      error: error.message,
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Login is only for local accounts
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Select password manually because it is hidden in the model
    const user = await User.findOne({
      email: normalizedEmail,
      authProvider: "local",
    }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Compare plain password with hashed password from MongoDB
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
};

export const logout = async (req, res) => {
  try {
    // If token is stored in localStorage/sessionStorage, the client removes it.
    // If you later switch to httpOnly cookies, clear the cookie here.
    return res.status(200).json({
      message: "Logout successful",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Logout failed",
      error: error.message,
    });
  }
};