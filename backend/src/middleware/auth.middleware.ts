import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'carousel-mix-secret-key-change-in-production';

export interface AuthRequest extends Request {
  userId?: string;
  username?: string;
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      username: string;
    };

    req.userId = decoded.userId;
    req.username = decoded.username;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

export const generateToken = (userId: string, username: string): string => {
  return jwt.sign(
    { userId, username },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};
