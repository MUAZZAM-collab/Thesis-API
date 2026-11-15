import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { isMongoConnected } from "../models/storage.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "teen-phone-addiction-jwt-secret-key-2026";

// In-memory user store if MongoDB is offline
const localUsers = [];

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, role = "parent" } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email, and password are required." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    if (isMongoConnected()) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(400).json({ error: "Email is already registered." });
      }

      const user = new User({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role
      });
      await user.save();

      const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, JWT_SECRET, {
        expiresIn: "7d"
      });

      return res.status(201).json({
        success: true,
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role }
      });
    }

    // Fallback store
    const existing = localUsers.find((u) => u.email === email.toLowerCase());
    if (existing) {
      return res.status(400).json({ error: "Email is already registered." });
    }

    const localUser = {
      id: "u_" + Date.now(),
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role
    };
    localUsers.push(localUser);

    const token = jwt.sign(
      { id: localUser.id, email: localUser.email, role: localUser.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      success: true,
      token,
      user: { id: localUser.id, name: localUser.name, email: localUser.email, role: localUser.role }
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ error: "Registration failed." });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    let user = null;
    if (isMongoConnected()) {
      user = await User.findOne({ email: email.toLowerCase() });
    } else {
      user = localUsers.find((u) => u.email === email.toLowerCase());
    }

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    const token = jwt.sign(
      { id: user._id || user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      token,
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: "Login failed." });
  }
});

// GET /api/auth/me
router.get("/me", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.json({ success: true, user: decoded });
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
});

export default router;
