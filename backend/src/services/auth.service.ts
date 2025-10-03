import bcrypt from 'bcryptjs';
import { prisma } from '../utils/db';
import { generateToken } from '../middleware/auth.middleware';

export class AuthService {
  /**
   * Login or auto-register user
   * If username doesn't exist, automatically create new user
   */
  async loginOrRegister(username: string, password: string) {
    try {
      // Check if user exists
      let user = await prisma.user.findUnique({
        where: { username }
      });

      // Auto-register if user doesn't exist
      if (!user) {
        const hashedPassword = await bcrypt.hash(password, 10);
        user = await prisma.user.create({
          data: {
            username,
            password: hashedPassword
          }
        });

        const token = generateToken(user.id, user.username);

        return {
          success: true,
          message: 'User registered successfully',
          isNewUser: true,
          data: {
            userId: user.id,
            username: user.username,
            token
          }
        };
      }

      // Verify password for existing user
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Invalid password',
          isNewUser: false
        };
      }

      const token = generateToken(user.id, user.username);

      return {
        success: true,
        message: 'Login successful',
        isNewUser: false,
        data: {
          userId: user.id,
          username: user.username,
          token
        }
      };
    } catch (error) {
      console.error('Auth error:', error);
      throw new Error('Authentication failed');
    }
  }

  /**
   * Verify token and get user
   */
  async verifyUser(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          createdAt: true
        }
      });

      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      return {
        success: true,
        data: user
      };
    } catch (error) {
      console.error('Verify user error:', error);
      throw new Error('User verification failed');
    }
  }
}
