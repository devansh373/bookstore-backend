import { Request, Response } from 'express';
  import { User } from '../models/bulkUsers';
  import bcrypt from 'bcryptjs';
  import jwt from 'jsonwebtoken';
import { AuthAccessModel } from "../models/authAccess";
import crypto from "crypto";

function generateRandomPassword(length: number = 12): string {
  return crypto
    .randomBytes(length)
    .toString("base64")   
    .slice(0, length);
}


  export const bulkCreateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const { users } = req.body;

      if (!Array.isArray(users) || users.length === 0) {
        res.status(400).json({ message: 'Users array is required and cannot be empty.' });
        return;
      }

      
      const validUsers = users.map((u: any) => ({
        username: u.username,
        email: u.email,
        role: u.role || 'User',
        password: u.password || generateRandomPassword(),
        phone: u.phone,
      })).filter(u => u.username && u.email);

      if (validUsers.length === 0) {
        res.status(400).json({ message: 'No valid users provided.' });
        return;
      }

      const savedUsers = await AuthAccessModel.insertMany(validUsers, { ordered: false });

      res.status(201).json({
        success: true,
        message: 'Users added successfully',
        users: savedUsers,
      });
    } catch (err: any) {
      if (err.name === 'ValidationError') {
        res.status(400).json({
          success: false,
          message: 'Validation failed',
          error: err.errors,
        });
      } else if (err.code === 11000) {
        res.status(400).json({
          success: false,
          message: 'Duplicate email found. Please use a unique email.',
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Server error',
          error: err.message,
        });
      }
    }
  };

  
export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ error: 'Username, email, and password are required' });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }

    const normalizedRole = (role || 'user').toLowerCase().trim();

    if (!['user', 'admin'].includes(normalizedRole)) {
      res.status(400).json({ error: 'Invalid role. Allowed roles: user, admin' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10));

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: normalizedRole,
    });

    await newUser.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'Server error during signup' });
  }
};


 
  export const login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      const user = await User.findOne({ email });
      if (!user) {
        res.status(400).json({ error: 'User not found' });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        res.status(400).json({ error: 'Incorrect password' });
        return;
      }

     
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1h' }
      );

      
      const refreshToken = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        message: 'Login successful',
        accessToken: token,
        user: {
          id: user._id,
          username: user.username,
          role: user.role,
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Server error during login' });
    }
  };