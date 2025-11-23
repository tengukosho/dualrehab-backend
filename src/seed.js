const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const expertPassword = await bcrypt.hash('expert123', 10);
  const patientPassword = await bcrypt.hash('patient123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@rehab.com' },
    update: {},
    create: {
      email: 'admin@rehab.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'admin'
    }
  });

  const expert = await prisma.user.upsert({
    where: { email: 'expert@rehab.com' },
    update: {},
    create: {
      email: 'expert@rehab.com',
      password: expertPassword,
      name: 'Dr. Sarah Johnson',
      role: 'expert',
      hospital: 'City General Hospital'
    }
  });

  const patient1 = await prisma.user.upsert({
    where: { email: 'patient1@email.com' },
    update: {},
    create: {
      email: 'patient1@email.com',
      password: patientPassword,
      name: 'John Doe',
      role: 'patient',
      hospital: 'City General Hospital',
      medicalRecordNo: 'MR-001',
      phoneNumber: '+1234567890',
      assignedExpertId: expert.id
    }
  });

  const patient2 = await prisma.user.upsert({
    where: { email: 'patient2@email.com' },
    update: {},
    create: {
      email: 'patient2@email.com',
      password: patientPassword,
      name: 'Jane Smith',
      role: 'patient',
      hospital: 'Community Health Center',
      medicalRecordNo: 'MR-002',
      phoneNumber: '+1234567891',
      assignedExpertId: expert.id
    }
  });

  console.log('✅ Users created');

  // Create categories
  const categories = [
    { name: 'Upper Body Exercises', description: 'Exercises focusing on arms, shoulders, and chest', order: 1 },
    { name: 'Lower Body Exercises', description: 'Exercises for legs, hips, and feet', order: 2 },
    { name: 'Core Strengthening', description: 'Exercises for abdominal and back muscles', order: 3 },
    { name: 'Balance & Coordination', description: 'Exercises to improve stability and motor skills', order: 4 },
    { name: 'Stretching & Flexibility', description: 'Gentle stretching routines', order: 5 }
  ];

  const createdCategories = [];
  for (const cat of categories) {
    const category = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat
    });
    createdCategories.push(category);
  }

  console.log('✅ Categories created');

  // Create sample videos (without actual files, just metadata)
  const videos = [
    {
      title: 'Arm Raises for Shoulder Mobility',
      description: 'Basic arm raising exercise to improve shoulder range of motion',
      categoryId: createdCategories[0].id,
      videoUrl: '/uploads/videos/sample-arm-raises.mp4',
      thumbnailUrl: '/uploads/thumbnails/arm-raises-thumb.jpg',
      duration: 300,
      difficultyLevel: 'beginner',
      instructions: '1. Stand or sit upright\n2. Slowly raise arms to shoulder height\n3. Hold for 3 seconds\n4. Lower slowly\n5. Repeat 10 times'
    },
    {
      title: 'Seated Leg Extensions',
      description: 'Strengthen quadriceps while seated',
      categoryId: createdCategories[1].id,
      videoUrl: '/uploads/videos/sample-leg-extensions.mp4',
      thumbnailUrl: '/uploads/thumbnails/leg-extensions-thumb.jpg',
      duration: 420,
      difficultyLevel: 'beginner',
      instructions: '1. Sit in a sturdy chair\n2. Extend one leg straight\n3. Hold for 5 seconds\n4. Lower slowly\n5. Repeat 10 times per leg'
    },
    {
      title: 'Basic Core Rotation',
      description: 'Gentle torso rotation for core strength',
      categoryId: createdCategories[2].id,
      videoUrl: '/uploads/videos/sample-core-rotation.mp4',
      thumbnailUrl: '/uploads/thumbnails/core-rotation-thumb.jpg',
      duration: 360,
      difficultyLevel: 'intermediate',
      instructions: '1. Sit upright with feet flat\n2. Place hands on shoulders\n3. Rotate torso left and right\n4. Keep hips stable\n5. Repeat 15 times each side'
    },
    {
      title: 'Standing Balance Exercise',
      description: 'Improve balance and stability',
      categoryId: createdCategories[3].id,
      videoUrl: '/uploads/videos/sample-balance.mp4',
      thumbnailUrl: '/uploads/thumbnails/balance-thumb.jpg',
      duration: 480,
      difficultyLevel: 'intermediate',
      instructions: '1. Stand near a wall for support\n2. Lift one foot slightly off ground\n3. Hold for 10 seconds\n4. Switch feet\n5. Repeat 5 times per foot'
    },
    {
      title: 'Neck and Shoulder Stretch',
      description: 'Gentle stretching for upper body',
      categoryId: createdCategories[4].id,
      videoUrl: '/uploads/videos/sample-stretch.mp4',
      thumbnailUrl: '/uploads/thumbnails/stretch-thumb.jpg',
      duration: 240,
      difficultyLevel: 'beginner',
      instructions: '1. Sit comfortably\n2. Tilt head to each side\n3. Hold each stretch for 15 seconds\n4. Roll shoulders backward\n5. Repeat 3 times'
    }
  ];

  const createdVideos = [];
  for (const video of videos) {
    const created = await prisma.video.create({
      data: video
    });
    createdVideos.push(created);
  }

  console.log('✅ Videos created');

  // Create sample schedules for patient1
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date(today);
  dayAfter.setDate(dayAfter.getDate() + 2);

  await prisma.schedule.createMany({
    data: [
      {
        userId: patient1.id,
        videoId: createdVideos[0].id,
        scheduledDate: today,
        completed: true,
        completedAt: today
      },
      {
        userId: patient1.id,
        videoId: createdVideos[1].id,
        scheduledDate: tomorrow,
        completed: false
      },
      {
        userId: patient1.id,
        videoId: createdVideos[2].id,
        scheduledDate: dayAfter,
        completed: false
      }
    ]
  });

  console.log('✅ Schedules created');

  // Create sample progress
  await prisma.userProgress.createMany({
    data: [
      {
        userId: patient1.id,
        videoId: createdVideos[0].id,
        completionDate: today,
        notes: 'Felt good, no pain',
        rating: 5
      },
      {
        userId: patient1.id,
        videoId: createdVideos[4].id,
        completionDate: new Date(today.getTime() - 86400000),
        notes: 'Very relaxing',
        rating: 5
      }
    ]
  });

  console.log('✅ Progress entries created');

  // Create sample messages
  await prisma.message.createMany({
    data: [
      {
        senderId: patient1.id,
        receiverId: expert.id,
        message: 'Hello Dr. Johnson, I have a question about the arm exercises.',
        isRead: true
      },
      {
        senderId: expert.id,
        receiverId: patient1.id,
        message: 'Hi John! Of course, what would you like to know?',
        isRead: false
      },
      {
        senderId: patient2.id,
        receiverId: expert.id,
        message: 'When should I schedule my next session?',
        isRead: false
      }
    ]
  });

  console.log('✅ Messages created');

  console.log('\n📋 Sample Credentials:');
  console.log('Admin: admin@rehab.com / admin123');
  console.log('Expert: expert@rehab.com / expert123');
  console.log('Patient: patient1@email.com / patient123');
  console.log('Patient: patient2@email.com / patient123');
  console.log('\n✨ Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
