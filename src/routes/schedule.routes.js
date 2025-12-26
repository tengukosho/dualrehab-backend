const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { startDate, endDate, completed } = req.query;

    const where = {
      userId: req.user.id
    };

    if (startDate || endDate) {
      where.scheduledDate = {};
      if (startDate) where.scheduledDate.gte = new Date(startDate);
      if (endDate) where.scheduledDate.lte = new Date(endDate);
    }

    if (completed !== undefined) {
      where.completed = completed === 'true';
    }

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    await prisma.schedule.deleteMany({
      where: {
        userId: req.user.id,
        completed: true,
        scheduledDate: {
          lt: oneDayAgo
        }
      }
    });

    const schedules = await prisma.schedule.findMany({
      where,
      include: {
        video: {
          select: {
            id: true,
            title: true,
            thumbnailUrl: true,
            duration: true,
            difficultyLevel: true,
            category: {
              select: {
                name: true
              }
            }
          }
        }
      },
      orderBy: { scheduledDate: 'asc' }
    });

    res.json(schedules);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const schedule = await prisma.schedule.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        video: true
      }
    });

    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    if (schedule.userId !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'expert') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(schedule);
  } catch (error) {
    next(error);
  }
});

router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { videoId, scheduledDate, userId } = req.body;

    const targetUserId = (req.user.role === 'admin' || req.user.role === 'expert') && userId
      ? parseInt(userId)
      : req.user.id;

    const schedule = await prisma.schedule.create({
      data: {
        userId: targetUserId,
        videoId: parseInt(videoId),
        scheduledDate: new Date(scheduledDate)
      },
      include: {
        video: true
      }
    });

    res.status(201).json(schedule);
  } catch (error) {
    next(error);
  }
});

router.put('/:id/complete', authMiddleware, async (req, res, next) => {
  try {
    const schedule = await prisma.schedule.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    if (schedule.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedSchedule = await prisma.schedule.update({
      where: { id: parseInt(req.params.id) },
      data: {
        completed: true,
        completedAt: new Date()
      },
      include: {
        video: true
      }
    });

    await prisma.userProgress.create({
      data: {
        userId: req.user.id,
        videoId: schedule.videoId,
        completionDate: new Date()
      }
    });

    res.json(updatedSchedule);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const schedule = await prisma.schedule.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found' });
    }

    if (schedule.userId !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'expert') {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.schedule.delete({
      where: { id: parseInt(req.params.id) }
    });

    res.json({ message: 'Schedule deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
