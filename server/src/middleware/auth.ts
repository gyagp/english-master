import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';

export interface AuthRequest extends Request {
  user?: { userId: number };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.sendStatus(401);
    return;
  }

  jwt.verify(token, JWT_SECRET, async (err: any, user: any) => {
    if (err) {
      res.sendStatus(403);
      return;
    }
    
    try {
      const dbUser = await prisma.user.findUnique({ where: { id: user.userId } });
      if (!dbUser) {
        return res.sendStatus(401);
      }
      req.user = user as { userId: number };
      next();
    } catch (error) {
      console.error("Auth error:", error);
      res.sendStatus(500);
    }
  });
};
