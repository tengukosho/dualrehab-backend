const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get overall statistics (admin/expert only)
router.get('/overview', authMiddleware, requireRole('admin', 'expert'), async (req, res, next) => {
  try {
    const totalUsers = await prisma.user.count({
      where: { role: 'patient' }
    });

    const totalExperts = await prisma.user.count({
      where: { role: 'expert' }
    });

    const totalVideos = await prisma.video.count();

    const totalCategories = await prisma.category.count();

    const totalCompletions = await prisma.userProgress.count();

    const totalSchedules = await prisma.schedule.count();

    const completedSchedules = await prisma.schedule.count({
      where: { completed: true }
    });

    const unreadMessages = await prisma.message.count({
      where: {
        receiverId: req.user.id,
        isRead: false
      }
    });

    res.json({
      users: {
        total: totalUsers,
        experts: totalExperts
      },
      content: {
        videos: totalVideos,
        categories: totalCategories
      },
      activity: {
        totalCompletions,
        totalSchedules,
        completedSchedules,
        completionRate: totalSchedules > 0 
          ? Math.round((completedSchedules / totalSchedules) * 100) 
          : 0
      },
      messages: {
        unread: unreadMessages
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get active users statistics
router.get('/active-users', authMiddleware, requireRole('admin', 'expert'), async (req, res, next) => {
  try {
    const { period = '7' } = req.query;
    const days = parseInt(period);

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Users who completed exercises
    const activeUsers = await prisma.userProgress.groupBy({
      by: ['userId'],
      where: {
        completionDate: {
          gte: startDate
        }
      },
      _count: true
    });

    // Users who logged in (approximated by message activity)
    const messagingUsers = await prisma.message.groupBy({
      by: ['senderId'],
      where: {
        timestamp: {
          gte: startDate
        }
      }
    });

    // Get daily active users for chart
    const dailyActivity = await prisma.userProgress.groupBy({
      by: ['completionDate'],
      where: {
        completionDate: {
          gte: startDate
        }
      },
      _count: {
        userId: true
      }
    });

    const dailyActiveUsers = dailyActivity.map(day => ({
      date: day.completionDate.toISOString().split('T')[0],
      count: day._count.userId
    }));

    res.json({
      activeUsers: activeUsers.length,
      messagingUsers: messagingUsers.length,
      dailyActivity: dailyActiveUsers
    });
  } catch (error) {
    next(error);
  }
});

// Get video statistics
router.get('/videos', authMiddleware, requireRole('admin', 'expert'), async (req, res, next) => {
  try {
    const videoStats = await prisma.video.findMany({
      select: {
        id: true,
        title: true,
        category: {
          select: {
            name: true
          }
        },
        _count: {
          select: {
            progress: true,
            schedules: true
          }
        }
      },
      orderBy: {
        progress: {
          _count: 'desc'
        }
      },
      take: 10
    });

    const formattedStats = videoStats.map(video => ({
      id: video.id,
      title: video.title,
      category: video.category.name,
      completions: video._count.progress,
      scheduled: video._count.schedules
    }));

    res.json({
      topVideos: formattedStats
    });
  } catch (error) {
    next(error);
  }
});

// Get user engagement statistics
router.get('/engagement', authMiddleware, requireRole('admin', 'expert'), async (req, res, next) => {
  try {
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Completion rate per user
    const usersWithSchedules = await prisma.user.findMany({
      where: {
        role: 'patient',
        schedules: {
          some: {
            scheduledDate: {
              gte: startDate
            }
          }
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        _count: {
          select: {
            schedules: true,
            progress: true
          }
        },
        schedules: {
          where: {
            scheduledDate: {
              gte: startDate
            },
            completed: true
          },
          select: {
            id: true
          }
        }
      },
      take: 20,
      orderBy: {
        progress: {
          _count: 'desc'
        }
      }
    });

    const engagement = usersWithSchedules.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      totalScheduled: user._count.schedules,
      completed: user.schedules.length,
      totalProgress: user._count.progress,
      completionRate: user._count.schedules > 0 
        ? Math.round((user.schedules.length / user._count.schedules) * 100)
        : 0
    }));

    res.json({
      users: engagement
    });
  } catch (error) {
    next(error);
  }
});

// Get category statistics
router.get('/categories', authMiddleware, requireRole('admin', 'expert'), async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            videos: true
          }
        },
        videos: {
          select: {
            _count: {
              select: {
                progress: true
              }
            }
          }
        }
      }
    });

    const categoryStats = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      videoCount: cat._count.videos,
      totalCompletions: cat.videos.reduce((sum, video) => 
        sum + video._count.progress, 0
      )
    }));

    res.json({
      categories: categoryStats
    });
  } catch (error) {
    next(error);
  }
});

// Get hospital statistics (admin only)
router.get('/hospitals', authMiddleware, requireRole('admin'), async (req, res, next) => {
  try {
    const hospitals = await prisma.user.groupBy({
      by: ['hospital'],
      where: {
        role: 'patient',
        hospital: {
          not: null
        }
      },
      _count: true
    });

    const hospitalStats = hospitals.map(h => ({
      hospital: h.hospital,
      patientCount: h._count
    }));

    res.json({
      hospitals: hospitalStats
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
