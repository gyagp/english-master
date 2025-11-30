import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Helper function to check and update lesson completion
const checkAndUpdateLessonCompletion = async (userId: number, unitId: number, lessonId: number) => {
  // Get all words for the lesson
  const words = await prisma.word.findMany({ where: { unitId, lessonId } });
  const completedWordsCount = await prisma.userWordProgress.count({
    where: {
      userId,
      wordId: { in: words.map(w => w.id) },
      isCompleted: true
    }
  });

  // Get all practices for the lesson
  const practices = await prisma.practice.findMany({ where: { unitId, lessonId } });
  const completedPracticesCount = await prisma.userPracticeProgress.count({
    where: {
      userId,
      practiceId: { in: practices.map(p => p.id) },
      isCompleted: true
    }
  });

  const allWordsCompleted = completedWordsCount === words.length;
  const allPracticesCompleted = completedPracticesCount === practices.length;
  const isLessonCompleted = allWordsCompleted && allPracticesCompleted;

  // Check previous state
  const previousProgress = await prisma.userLessonProgress.findUnique({
    where: { userId_unitId_lessonId: { userId, unitId, lessonId } },
  });

  const wasCompleted = previousProgress?.isCompleted || false;

  if (isLessonCompleted && !wasCompleted) {
      // Record completion history
      await prisma.lessonCompletion.create({
          data: { userId, unitId, lessonId }
      });
  }

  await prisma.userLessonProgress.upsert({
    where: { userId_unitId_lessonId: { userId, unitId, lessonId } },
    update: { isCompleted: isLessonCompleted },
    create: { userId, unitId, lessonId, isCompleted: isLessonCompleted },
  });

  return isLessonCompleted;
};

router.get('/progress', authenticateToken, async (req: any, res) => {
  const userId = (req as AuthRequest).user!.userId;
  
  const wordProgress = await prisma.userWordProgress.findMany({
    where: { userId, isCompleted: true },
  });

  const lessonProgress = await prisma.userLessonProgress.findMany({
    where: { userId, isCompleted: true },
  });

  const practiceProgress = await prisma.userPracticeProgress.findMany({
    where: { userId, isCompleted: true },
  });

  res.json({
    completedWords: wordProgress.length,
    completedLessons: lessonProgress.length,
    completedPractices: practiceProgress.length,
    details: {
        words: wordProgress.map(p => p.wordId),
        lessons: lessonProgress,
        practices: practiceProgress.map(p => p.practiceId)
    }
  });
});

router.post('/words/:id/toggle', authenticateToken, async (req: any, res) => {
  const userId = (req as AuthRequest).user!.userId;
  const wordId = parseInt(req.params.id);
  
  const word = await prisma.word.findUnique({ where: { id: wordId } });
  if (!word) return res.status(404).json({ error: 'Word not found' });

  const existing = await prisma.userWordProgress.findUnique({
    where: { userId_wordId: { userId, wordId } },
  });

  let updated;
  if (existing) {
    updated = await prisma.userWordProgress.update({
      where: { userId_wordId: { userId, wordId } },
      data: { isCompleted: !existing.isCompleted },
    });
  } else {
    updated = await prisma.userWordProgress.create({
      data: { userId, wordId, isCompleted: true },
    });
  }

  await checkAndUpdateLessonCompletion(userId, word.unitId, word.lessonId);
  res.json(updated);
});

router.post('/practices/:id/complete', authenticateToken, async (req: any, res) => {
    const userId = (req as AuthRequest).user!.userId;
    const practiceId = parseInt(req.params.id);

    const practice = await prisma.practice.findUnique({ where: { id: practiceId } });
    if (!practice) return res.status(404).json({ error: 'Practice not found' });

    const progress = await prisma.userPracticeProgress.upsert({
        where: { userId_practiceId: { userId, practiceId } },
        update: { isCompleted: true },
        create: { userId, practiceId, isCompleted: true },
    });

    await checkAndUpdateLessonCompletion(userId, practice.unitId, practice.lessonId);
    res.json(progress);
});

router.post('/practices/:id/toggle', authenticateToken, async (req: any, res) => {
    const userId = (req as AuthRequest).user!.userId;
    const practiceId = parseInt(req.params.id);

    const practice = await prisma.practice.findUnique({ where: { id: practiceId } });
    if (!practice) return res.status(404).json({ error: 'Practice not found' });

    const existing = await prisma.userPracticeProgress.findUnique({
        where: { userId_practiceId: { userId, practiceId } },
    });

    let updated;
    if (existing) {
        updated = await prisma.userPracticeProgress.update({
            where: { userId_practiceId: { userId, practiceId } },
            data: { isCompleted: !existing.isCompleted },
        });
    } else {
        updated = await prisma.userPracticeProgress.create({
            data: { userId, practiceId, isCompleted: true },
        });
    }

    await checkAndUpdateLessonCompletion(userId, practice.unitId, practice.lessonId);
    res.json(updated);
});

// Reset Lesson (Review)
router.post('/lessons/:unitId/:lessonId/reset', authenticateToken, async (req: any, res) => {
    const userId = (req as AuthRequest).user!.userId;
    const unitId = parseInt(req.params.unitId);
    const lessonId = parseInt(req.params.lessonId);

    try {
        // 1. Reset Words
        const words = await prisma.word.findMany({ where: { unitId, lessonId } });
        await prisma.userWordProgress.deleteMany({
            where: {
                userId,
                wordId: { in: words.map(w => w.id) }
            }
        });

        // 2. Reset Practices
        const practices = await prisma.practice.findMany({ where: { unitId, lessonId } });
        await prisma.userPracticeProgress.deleteMany({
            where: {
                userId,
                practiceId: { in: practices.map(p => p.id) }
            }
        });

        // 3. Reset Lesson Progress (but keep history)
        // We use updateMany to avoid error if record doesn't exist (though it should if we are resetting)
        await prisma.userLessonProgress.updateMany({
            where: { userId, unitId, lessonId },
            data: { isCompleted: false }
        });

        res.json({ message: 'Lesson reset for review' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to reset lesson' });
    }
});

// Get Lesson History
router.get('/lessons/:unitId/:lessonId/history', authenticateToken, async (req: any, res) => {
    const userId = (req as AuthRequest).user!.userId;
    const unitId = parseInt(req.params.unitId);
    const lessonId = parseInt(req.params.lessonId);

    const history = await prisma.lessonCompletion.findMany({
        where: { userId, unitId, lessonId },
        orderBy: { completedAt: 'desc' }
    });

    res.json(history);
});

export default router;
