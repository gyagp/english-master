import express from 'express';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        createdAt: true,
        _count: {
          select: {
            wordProgress: { where: { isCompleted: true } },
            lessonProgress: { where: { isCompleted: true } },
            practiceProgress: { where: { isCompleted: true } }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Delete a user
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const userId = parseInt(id);
    
    // Delete all related progress first
    await prisma.userWordProgress.deleteMany({ where: { userId } });
    await prisma.userLessonProgress.deleteMany({ where: { userId } });
    await prisma.userPracticeProgress.deleteMany({ where: { userId } });
    
    // Delete the user
    await prisma.user.delete({ where: { id: userId } });
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
