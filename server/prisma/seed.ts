const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // ...existing code...
  const unitId = 1;
  const lessonId = 1;

  console.log('Seeding data...');

  // Words
  const words = [
    {
      unitId,
      lessonId,
      word: 'Apple',
      phonetic: '/ˈæp.l/',
      englishMeaning: 'A round fruit with red or green skin and a white inside.',
      chineseMeaning: '苹果',
      example: 'I eat an apple every day.',
    },
    {
      unitId,
      lessonId,
      word: 'Banana',
      phonetic: '/bəˈnɑː.nə/',
      englishMeaning: 'A long, curved fruit with a yellow skin and soft, sweet, white flesh.',
      chineseMeaning: '香蕉',
      example: 'Monkeys love bananas.',
    },
    {
      unitId,
      lessonId,
      word: 'Cat',
      phonetic: '/kæt/',
      englishMeaning: 'A small animal with fur, four legs, a tail, and claws, usually kept as a pet.',
      chineseMeaning: '猫',
      example: 'The cat is sleeping on the sofa.',
    },
  ];

  for (const w of words) {
    await prisma.word.create({ data: w });
  }

  // Practices (Cloze)
  const practices = [
    {
      unitId,
      lessonId,
      practice: 'I eat an _____ every day.',
      answer: 'apple',
    },
    {
      unitId,
      lessonId,
      practice: 'The _____ is sleeping on the sofa.',
      answer: 'cat',
    },
  ];

  for (const p of practices) {
    await prisma.practice.create({ data: p });
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
