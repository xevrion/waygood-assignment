import { User } from "../models/User.js";
import { createToken } from "../services/tokenService.js";

export async function register(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password || password.length < 8) {
    return res.status(400).json({
      message: "Name, email, and password with minimum 8 characters are required"
    });
  }

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(409).json({ message: "Email already registered" });
  }

  const passwordHash = await User.hashPassword(password);
  const user = await User.create({
    name,
    email,
    passwordHash
  });

  return res.status(201).json({
    token: createToken(user),
    user: {
      id: user._id,
      name: user.name,
      email: user.email
    }
  });
}

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isValid = await user.comparePassword(password);
  if (!isValid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  return res.json({
    token: createToken(user),
    user: {
      id: user._id,
      name: user.name,
      email: user.email
    }
  });
}

export function me(req, res) {
  return res.json({ user: req.user });
}

