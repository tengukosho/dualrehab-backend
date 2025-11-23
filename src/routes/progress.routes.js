const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get user's progress
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { videoId, startDate, endDate, page = 1, limit = 20 } = req.query;

    const where = {
      userId: req.user.id
    };

    if (videoId) where.videoId = parseInt(videoId);

    if (startDate || endDate) {
      where.completionDate = {};
      if (startDate) where.completionDate.gte = new Date(startDate);
      if (endDate) where.completionDate.lte = new Date(endDate);
    }

    const progress = await prisma.userProgress.findMany({
      where,
      include: {
        video: {
          select: {
            id: true,
            title: true,
            thumbnailUrl: true,
            duration: true,
            category: {
              select: {
                name: true
              }
            }
          }
        }
      },
      skip: (page - 1) * limit,
      take: parseInt(limit),
      orderBy: { completionDate: 'desc' }
    });

    const total = await prisma.userProgress.count({ where });

    res.json({
      progress,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get progress statistics
router.get('/stats', authMiddleware, async (req, res, next) => {
  try {
    const totalCompleted = await prisma.userProgress.count({
      where: { userId: req.user.id }
    });

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const completedLast7Days = await prisma.userProgress.count({
      where: {
        userId: req.user.id,
        completionDate: {
          gte: last7Days
        }
      }
    });

    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const completedLast30Days = await prisma.userProgress.count({
      where: {
        userId: req.user.id,
        completionDate: {
          gte: last30Days
        }
      }
    });

    // Get unique videos completed
    const uniqueVideos = await prisma.userProgress.groupBy({
      by: ['videoId'],
      where: { userId: req.user.id },
      _count: true
    });

    // Get current streak
    const allProgress = await prisma.userProgress.findMany({
      where: { userId: req.user.id },
      orderBy: { completionDate: 'desc' },
      select: { completionDate: true }
    });

    let currentStreak = 0;
    if (allProgress.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let checkDate = new Date(today);
      const progressDates = new Set(
        allProgress.map(p => {
          const d = new Date(p.completionDate);
          d.setHours(0, 0, 0, 0);
          return d.getTime();
        })
      );

      while (progressDates.has(checkDate.getTime())) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      }
    }

    res.json({
      totalCompleted,
      completedLast7Days,
      completedLast30Days,
      uniqueVideosCompleted: uniqueVideos.length,
      currentStreak
    });
  } catch (error) {
    next(error);
  }
});

// Record video completion
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { videoId, notes, rating } = req.body;

    const progress = await prisma.userProgress.create({
      data: {
        userId: req.user.id,
        videoId: parseInt(videoId),
        notes,
        rating: rating ? parseInt(rating) : null
      },
      include: {
        video: true
      }
    });

    res.status(201).json(progress);
  } catch (error) {
    next(error);
  }
});

// Update progress entry
router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    const { notes, rating } = req.body;

    const existing = await prisma.userProgress.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!existing) {
      return res.status(404).json({ error: 'Progress entry not found' });
    }

    if (existing.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const progress = await prisma.userProgress.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(notes !== undefined && { notes }),
        ...(rating !== undefined && { rating: rating ? parseInt(rating) : null })
      }
    });

    res.json(progress);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
