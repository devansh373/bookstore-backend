import { Request, Response } from "express";
import { AuthAccessModel } from "../models/authAccess";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET as string;

// Bookstore Login API (role only from DB)
export const bookstoreLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // 1. Find user by email
    const user = await AuthAccessModel.findOne({ email });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // 2. Validate password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    // 3. Generate JWT (role only from DB)
    const token = jwt.sign(
      { id: user._id, role: user.role },
      SECRET_KEY,
      { expiresIn: "1d" }
    );

    // 4. Send response
    res.json({
      message: "Bookstore login successful",
      user: {
        id: user._id,
        email: user.email,
        role: user.role, // role is only from DB
      },
      token,
    });
  } catch (err) {
    res.status(500).json({ error: "Bookstore login failed" });
  }
};
