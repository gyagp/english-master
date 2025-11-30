import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up all users...');
  
  // Delete all related data first to avoid foreign key constraints if cascade isn't set up
  // Although Prisma usually handles this if configured, explicit deletion is safer
  await prisma.userWordProgress.deleteMany({});
  await prisma.userLessonProgress.deleteMany({});
  await prisma.userPracticeProgress.deleteMany({});
  
  // Delete users
  const deletedUsers = await prisma.user.deleteMany({});
  
  console.log(`Deleted ${deletedUsers.count} users.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
