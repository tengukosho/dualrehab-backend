const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...\n');

  // Clear existing data (optional - comment out if you want to keep existing users)
  console.log('🗑️  Clearing old data...');
  await prisma.userProgress.deleteMany({});
  await prisma.schedule.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.video.deleteMany({});
  await prisma.category.deleteMany({});
  // Keep users but you can clear if needed

  // Create Categories
  console.log('📁 Creating categories...');
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Upper Body Exercises',
        description: 'Exercises focusing on shoulders, arms, and upper back rehabilitation',
        order: 1
      }
    }),
    prisma.category.create({
      data: {
        name: 'Lower Body Exercises',
        description: 'Leg, knee, and ankle rehabilitation exercises',
        order: 2
      }
    }),
    prisma.category.create({
      data: {
        name: 'Core Strengthening',
        description: 'Exercises for core stability and back health',
        order: 3
      }
    }),
    prisma.category.create({
      data: {
        name: 'Flexibility & Stretching',
        description: 'Improving range of motion and flexibility',
        order: 4
      }
    }),
    prisma.category.create({
      data: {
        name: 'Balance & Coordination',
        description: 'Exercises to improve balance and coordination',
        order: 5
      }
    })
  ]);
  console.log(`✅ Created ${categories.length} categories\n`);

  // Create Videos
  console.log('🎥 Creating sample videos...');
  const videos = await Promise.all([
    // Upper Body
    prisma.video.create({
      data: {
        title: 'Shoulder Rotations',
        description: 'Gentle shoulder rotation exercises for mobility',
        categoryId: categories[0].id,
        videoUrl: 'https://example.com/shoulder-rotations.mp4',
        thumbnailUrl: 'https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Shoulder+Rotations',
        duration: 300,
        difficultyLevel: 'beginner',
        instructions: '1. Stand or sit comfortably\n2. Slowly rotate shoulders forward 10 times\n3. Reverse direction for 10 rotations\n4. Repeat 3 sets'
      }
    }),
    prisma.video.create({
      data: {
        title: 'Arm Raises',
        description: 'Strengthen shoulder and arm muscles',
        categoryId: categories[0].id,
        videoUrl: 'https://example.com/arm-raises.mp4',
        thumbnailUrl: 'https://via.placeholder.com/400x300/7C3AED/FFFFFF?text=Arm+Raises',
        duration: 420,
        difficultyLevel: 'intermediate',
        instructions: '1. Stand with feet shoulder-width apart\n2. Raise arms to shoulder height\n3. Hold for 5 seconds\n4. Lower slowly\n5. Repeat 15 times'
      }
    }),
    
    // Lower Body
    prisma.video.create({
      data: {
        title: 'Knee Bends',
        description: 'Basic knee flexion exercises',
        categoryId: categories[1].id,
        videoUrl: 'https://example.com/knee-bends.mp4',
        thumbnailUrl: 'https://via.placeholder.com/400x300/EC4899/FFFFFF?text=Knee+Bends',
        duration: 360,
        difficultyLevel: 'beginner',
        instructions: '1. Hold onto a chair for support\n2. Slowly bend knees\n3. Return to standing\n4. Repeat 10-12 times'
      }
    }),
    prisma.video.create({
      data: {
        title: 'Calf Raises',
        description: 'Strengthen calf and ankle muscles',
        categoryId: categories[1].id,
        videoUrl: 'https://example.com/calf-raises.mp4',
        thumbnailUrl: 'https://via.placeholder.com/400x300/10B981/FFFFFF?text=Calf+Raises',
        duration: 240,
        difficultyLevel: 'beginner',
        instructions: '1. Stand near a wall for balance\n2. Rise up on toes\n3. Hold for 2 seconds\n4. Lower slowly\n5. Repeat 20 times'
      }
    }),
    prisma.video.create({
      data: {
        title: 'Leg Extensions',
        description: 'Quadriceps strengthening exercise',
        categoryId: categories[1].id,
        videoUrl: 'https://example.com/leg-extensions.mp4',
        thumbnailUrl: 'https://via.placeholder.com/400x300/F59E0B/FFFFFF?text=Leg+Extensions',
        duration: 480,
        difficultyLevel: 'intermediate',
        instructions: '1. Sit on a chair\n2. Extend one leg straight\n3. Hold for 5 seconds\n4. Lower slowly\n5. Repeat 12 times each leg'
      }
    }),

    // Core
    prisma.video.create({
      data: {
        title: 'Pelvic Tilts',
        description: 'Gentle lower back and core exercise',
        categoryId: categories[2].id,
        videoUrl: 'https://example.com/pelvic-tilts.mp4',
        thumbnailUrl: 'https://via.placeholder.com/400x300/EF4444/FFFFFF?text=Pelvic+Tilts',
        duration: 300,
        difficultyLevel: 'beginner',
        instructions: '1. Lie on back, knees bent\n2. Flatten lower back to floor\n3. Hold for 5 seconds\n4. Relax\n5. Repeat 10 times'
      }
    }),
    prisma.video.create({
      data: {
        title: 'Bridge Exercise',
        description: 'Strengthen glutes and lower back',
        categoryId: categories[2].id,
        videoUrl: 'https://example.com/bridge.mp4',
        thumbnailUrl: 'https://via.placeholder.com/400x300/06B6D4/FFFFFF?text=Bridge+Exercise',
        duration: 360,
        difficultyLevel: 'intermediate',
        instructions: '1. Lie on back, knees bent\n2. Lift hips off floor\n3. Hold for 10 seconds\n4. Lower slowly\n5. Repeat 8-10 times'
      }
    }),

    // Flexibility
    prisma.video.create({
      data: {
        title: 'Hamstring Stretch',
        description: 'Improve leg flexibility',
        categoryId: categories[3].id,
        videoUrl: 'https://example.com/hamstring-stretch.mp4',
        thumbnailUrl: 'https://via.placeholder.com/400x300/8B5CF6/FFFFFF?text=Hamstring+Stretch',
        duration: 180,
        difficultyLevel: 'beginner',
        instructions: '1. Sit on floor, legs extended\n2. Reach toward toes\n3. Hold for 30 seconds\n4. Relax\n5. Repeat 3 times'
      }
    }),
    prisma.video.create({
      data: {
        title: 'Neck Stretches',
        description: 'Release neck tension',
        categoryId: categories[3].id,
        videoUrl: 'https://example.com/neck-stretch.mp4',
        thumbnailUrl: 'https://via.placeholder.com/400x300/14B8A6/FFFFFF?text=Neck+Stretches',
        duration: 240,
        difficultyLevel: 'beginner',
        instructions: '1. Sit or stand comfortably\n2. Tilt head to right shoulder\n3. Hold 15 seconds\n4. Repeat on left\n5. Do 3 times each side'
      }
    }),

    // Balance
    prisma.video.create({
      data: {
        title: 'Single Leg Stand',
        description: 'Improve balance and stability',
        categoryId: categories[4].id,
        videoUrl: 'https://example.com/single-leg-stand.mp4',
        thumbnailUrl: 'https://via.placeholder.com/400x300/F97316/FFFFFF?text=Balance+Exercise',
        duration: 300,
        difficultyLevel: 'intermediate',
        instructions: '1. Stand near a wall for safety\n2. Lift one foot off ground\n3. Hold for 30 seconds\n4. Switch legs\n5. Repeat 3 times each'
      }
    }),
    prisma.video.create({
      data: {
        title: 'Heel-to-Toe Walk',
        description: 'Advanced balance training',
        categoryId: categories[4].id,
        videoUrl: 'https://example.com/heel-toe-walk.mp4',
        thumbnailUrl: 'https://via.placeholder.com/400x300/84CC16/FFFFFF?text=Walking+Balance',
        duration: 420,
        difficultyLevel: 'advanced',
        instructions: '1. Walk in a straight line\n2. Place heel of one foot directly in front of toes of other\n3. Walk 20 steps\n4. Turn and repeat\n5. Do 3 sets'
      }
    })
  ]);
  console.log(`✅ Created ${videos.length} videos\n`);

  // Create Sample Patients
  console.log('👥 Creating sample patients...');
  const hashedPassword = await bcrypt.hash('patient123', 10);
  
  const patients = await Promise.all([
    prisma.user.create({
      data: {
        email: 'john.doe@email.com',
        password: hashedPassword,
        name: 'John Doe',
        role: 'patient',
        hospital: 'Central Hospital',
        phoneNumber: '+1234567890',
        medicalRecordNo: 'MR001'
      }
    }),
    prisma.user.create({
      data: {
        email: 'sarah.smith@email.com',
        password: hashedPassword,
        name: 'Sarah Smith',
        role: 'patient',
        hospital: 'Central Hospital',
        phoneNumber: '+1234567891',
        medicalRecordNo: 'MR002'
      }
    }),
    prisma.user.create({
      data: {
        email: 'mike.johnson@email.com',
        password: hashedPassword,
        name: 'Mike Johnson',
        role: 'patient',
        hospital: 'City Medical Center',
        phoneNumber: '+1234567892',
        medicalRecordNo: 'MR003'
      }
    }),
    prisma.user.create({
      data: {
        email: 'emily.brown@email.com',
        password: hashedPassword,
        name: 'Emily Brown',
        role: 'patient',
        hospital: 'Central Hospital',
        phoneNumber: '+1234567893',
        medicalRecordNo: 'MR004'
      }
    }),
    prisma.user.create({
      data: {
        email: 'david.wilson@email.com',
        password: hashedPassword,
        name: 'David Wilson',
        role: 'patient',
        hospital: 'City Medical Center',
        phoneNumber: '+1234567894',
        medicalRecordNo: 'MR005'
      }
    })
  ]);
  console.log(`✅ Created ${patients.length} patients\n`);

  // Create Progress Records
  console.log('📊 Creating progress records...');
  const progressRecords = [];
  
  // Create varied progress for each patient
  for (let i = 0; i < patients.length; i++) {
    const patient = patients[i];
    const numRecords = Math.floor(Math.random() * 15) + 5; // 5-20 records per patient
    
    for (let j = 0; j < numRecords; j++) {
      const randomVideo = videos[Math.floor(Math.random() * videos.length)];
      const daysAgo = Math.floor(Math.random() * 60); // Within last 60 days
      const completionDate = new Date();
      completionDate.setDate(completionDate.getDate() - daysAgo);
      
      progressRecords.push(
        prisma.userProgress.create({
          data: {
            userId: patient.id,
            videoId: randomVideo.id,
            completionDate: completionDate.toISOString(),
            rating: Math.floor(Math.random() * 3) + 3, // Rating 3-5
            notes: ['Great session!', 'Felt easier today', 'Challenging but good', 'No pain', 'Improving'][Math.floor(Math.random() * 5)]
          }
        })
      );
    }
  }
  
  await Promise.all(progressRecords);
  console.log(`✅ Created ${progressRecords.length} progress records\n`);

  // Create Schedules
  console.log('📅 Creating schedules...');
  const schedules = [];
  
  for (let i = 0; i < patients.length; i++) {
    const patient = patients[i];
    const numSchedules = Math.floor(Math.random() * 8) + 3; // 3-10 schedules per patient
    
    for (let j = 0; j < numSchedules; j++) {
      const randomVideo = videos[Math.floor(Math.random() * videos.length)];
      const daysFromNow = Math.floor(Math.random() * 14) - 7; // -7 to +7 days
      const scheduleDate = new Date();
      scheduleDate.setDate(scheduleDate.getDate() + daysFromNow);
      scheduleDate.setHours(9 + Math.floor(Math.random() * 8), 0, 0); // 9 AM to 5 PM
      
      const isCompleted = daysFromNow < 0 && Math.random() > 0.3; // 70% of past schedules completed
      
      schedules.push(
        prisma.schedule.create({
          data: {
            userId: patient.id,
            videoId: randomVideo.id,
            scheduledDate: scheduleDate.toISOString(),
            completed: isCompleted,
            completedAt: isCompleted ? scheduleDate.toISOString() : null
          }
        })
      );
    }
  }
  
  await Promise.all(schedules);
  console.log(`✅ Created ${schedules.length} schedules\n`);

  console.log('🎉 Database seeding completed!\n');
  console.log('📋 Summary:');
  console.log(`   Categories: ${categories.length}`);
  console.log(`   Videos: ${videos.length}`);
  console.log(`   Patients: ${patients.length}`);
  console.log(`   Progress Records: ${progressRecords.length}`);
  console.log(`   Schedules: ${schedules.length}`);
  console.log('\n🔑 Login credentials for all patients:');
  console.log('   Password: patient123\n');
  patients.forEach(p => {
    console.log(`   📧 ${p.email} - ${p.name}`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
