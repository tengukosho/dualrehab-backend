const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get current user profile
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        hospital: true,
        medicalRecordNo: true,
        phoneNumber: true,
        assignedExpertId: true,
        assignedExpert: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        createdAt: true
      }
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Update user profile
router.put('/me', authMiddleware, async (req, res, next) => {
  try {
    const { name, hospital, phoneNumber } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(name && { name }),
        ...(hospital && { hospital }),
        ...(phoneNumber && { phoneNumber })
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        hospital: true,
        phoneNumber: true
      }
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Get all users (admin/expert only)
router.get('/', authMiddleware, requireRole('admin', 'expert'), async (req, res, next) => {
  try {
    const { role, hospital, page = 1, limit = 20 } = req.query;

    const where = {};
    if (role) where.role = role;
    if (hospital) where.hospital = hospital;

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        hospital: true,
        assignedExpertId: true,
        createdAt: true
      },
      skip: (page - 1) * limit,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' }
    });

    const total = await prisma.user.count({ where });

    res.json({
      users,
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

// Get user by ID (admin/expert only)
router.get('/:id', authMiddleware, requireRole('admin', 'expert'), async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        hospital: true,
        medicalRecordNo: true,
        phoneNumber: true,
        assignedExpertId: true,
        createdAt: true,
        progress: {
          include: {
            video: {
              select: {
                id: true,
                title: true,
                categoryId: true
              }
            }
          },
          orderBy: { completionDate: 'desc' },
          take: 10
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Assign expert to patient (admin only)
router.put('/:id/assign-expert', authMiddleware, requireRole('admin'), async (req, res, next) => {
  try {
    const { expertId } = req.body;

    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: {
        assignedExpertId: expertId ? parseInt(expertId) : null
      },
      select: {
        id: true,
        name: true,
        assignedExpert: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json(user);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
