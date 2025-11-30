import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get structure (Units and Lessons) with progress
router.get('/structure', authenticateToken, async (req: any, res) => {
  const userId = req.user!.userId;

  const words = await prisma.word.findMany({
    select: { id: true, unitId: true, lessonId: true },
  });
  
  const practices = await prisma.practice.findMany({
    select: { id: true, unitId: true, lessonId: true },
  });

  const wordProgress = await prisma.userWordProgress.findMany({
    where: { userId, isCompleted: true },
    select: { wordId: true },
  });

  const practiceProgress = await prisma.userPracticeProgress.findMany({
    where: { userId, isCompleted: true },
    select: { practiceId: true },
  });

  const completedWordIds = new Set(wordProgress.map(wp => wp.wordId));
  const completedPracticeIds = new Set(practiceProgress.map(pp => pp.practiceId));

  // Merge and structure
  const structure: any = {};
  
  words.forEach(word => {
    const { unitId, lessonId } = word;
    if (!structure[unitId]) structure[unitId] = {};
    if (!structure[unitId][lessonId]) {
      structure[unitId][lessonId] = { 
        lessonId, 
        totalWords: 0, 
        completedWords: 0, 
        totalPractices: 0, 
        completedPractices: 0 
      };
    }
    structure[unitId][lessonId].totalWords++;
    if (completedWordIds.has(word.id)) {
      structure[unitId][lessonId].completedWords++;
    }
  });

  practices.forEach(practice => {
    const { unitId, lessonId } = practice;
    if (!structure[unitId]) structure[unitId] = {};
    if (!structure[unitId][lessonId]) {
      structure[unitId][lessonId] = { 
        lessonId, 
        totalWords: 0, 
        completedWords: 0, 
        totalPractices: 0, 
        completedPractices: 0 
      };
    }
    structure[unitId][lessonId].totalPractices++;
    if (completedPracticeIds.has(practice.id)) {
      structure[unitId][lessonId].completedPractices++;
    }
  });

  const result = Object.keys(structure).map(unitId => ({
    unitId: parseInt(unitId),
    lessons: Object.values(structure[unitId]).sort((a: any, b: any) => a.lessonId - b.lessonId)
  }));

  res.json(result);
});

router.get('/units/:unitId/lessons/:lessonId/words', authenticateToken, async (req, res) => {
  const { unitId, lessonId } = req.params;
  const words = await prisma.word.findMany({
    where: {
      unitId: parseInt(unitId),
      lessonId: parseInt(lessonId),
    },
  });
  res.json(words);
});

router.get('/units/:unitId/lessons/:lessonId/practices', authenticateToken, async (req, res) => {
  const { unitId, lessonId } = req.params;
  const practices = await prisma.practice.findMany({
    where: {
      unitId: parseInt(unitId),
      lessonId: parseInt(lessonId),
    },
  });
  res.json(practices);
});

// --- Management Endpoints ---

// Create Word
router.post('/words', authenticateToken, async (req, res) => {
  const { unitId, lessonId, word, phonetic, englishMeaning, chineseMeaning, example } = req.body;
  try {
    const newWord = await prisma.word.create({
      data: {
        unitId: parseInt(unitId),
        lessonId: parseInt(lessonId),
        word,
        phonetic,
        englishMeaning,
        chineseMeaning,
        example,
      },
    });
    res.json(newWord);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create word' });
  }
});

// Update Word
router.put('/words/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { word, phonetic, englishMeaning, chineseMeaning, example } = req.body;
  try {
    const updatedWord = await prisma.word.update({
      where: { id: parseInt(id) },
      data: {
        word,
        phonetic,
        englishMeaning,
        chineseMeaning,
        example,
      },
    });
    res.json(updatedWord);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update word' });
  }
});

// Delete Word
router.delete('/words/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.word.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: 'Word deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete word' });
  }
});

// Bulk Create Words
router.post('/words/bulk', authenticateToken, async (req, res) => {
  const { unitId, lessonId, words } = req.body;
  
  if (!Array.isArray(words)) {
    res.status(400).json({ error: 'Words must be an array' });
    return;
  }

  try {
    const createdWords = await prisma.$transaction(
      words.map((w: any) => 
        prisma.word.create({
          data: {
            unitId: parseInt(unitId),
            lessonId: parseInt(lessonId),
            word: w.word,
            phonetic: w.phonetic,
            englishMeaning: w.englishMeaning,
            chineseMeaning: w.chineseMeaning,
            example: w.example,
          },
        })
      )
    );
    res.json(createdWords);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create words' });
  }
});

// Create Practice
router.post('/practices', authenticateToken, async (req, res) => {
  const { unitId, lessonId, practice, answer } = req.body;
  try {
    const newPractice = await prisma.practice.create({
      data: {
        unitId: parseInt(unitId),
        lessonId: parseInt(lessonId),
        practice,
        answer,
      },
    });
    res.json(newPractice);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create practice' });
  }
});

// Update Practice
router.put('/practices/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { practice, answer } = req.body;
  try {
    const updatedPractice = await prisma.practice.update({
      where: { id: parseInt(id) },
      data: {
        practice,
        answer,
      },
    });
    res.json(updatedPractice);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update practice' });
  }
});

// Delete Practice
router.delete('/practices/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.practice.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: 'Practice deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete practice' });
  }
});

// Bulk Create Practices
router.post('/practices/bulk', authenticateToken, async (req, res) => {
  const { unitId, lessonId, practices } = req.body;
  
  if (!Array.isArray(practices)) {
    res.status(400).json({ error: 'Practices must be an array' });
    return;
  }

  try {
    const createdPractices = await prisma.$transaction(
      practices.map((p: any) => 
        prisma.practice.create({
          data: {
            unitId: parseInt(unitId),
            lessonId: parseInt(lessonId),
            practice: p.practice,
            answer: p.answer,
          },
        })
      )
    );
    res.json(createdPractices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create practices' });
  }
});

// Import Lesson (Words + Practices)
router.post('/lesson/import', authenticateToken, async (req, res) => {
  const { unitId, lessonId, words, practices } = req.body;

  try {
    const operations: any[] = [];

    if (words && Array.isArray(words)) {
        words.forEach((w: any) => {
            operations.push(prisma.word.create({
                data: {
                    unitId: parseInt(unitId),
                    lessonId: parseInt(lessonId),
                    word: w.word,
                    phonetic: w.phonetic,
                    englishMeaning: w.englishMeaning,
                    chineseMeaning: w.chineseMeaning,
                    example: w.example,
                }
            }));
        });
    }

    if (practices && Array.isArray(practices)) {
        practices.forEach((p: any) => {
            operations.push(prisma.practice.create({
                data: {
                    unitId: parseInt(unitId),
                    lessonId: parseInt(lessonId),
                    practice: p.practice,
                    answer: p.answer,
                }
            }));
        });
    }

    await prisma.$transaction(operations);
    res.json({ message: 'Lesson imported successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to import lesson' });
  }
});

export default router;
