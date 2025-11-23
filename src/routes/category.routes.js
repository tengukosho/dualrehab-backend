const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get all categories (public)
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { videos: true }
        }
      }
    });

    res.json(categories);
  } catch (error) {
    next(error);
  }
});

// Get category by ID
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        videos: {
          select: {
            id: true,
            title: true,
            description: true,
            thumbnailUrl: true,
            duration: true,
            difficultyLevel: true
          }
        }
      }
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    next(error);
  }
});

// Create category (admin only)
router.post('/', authMiddleware, requireRole('admin'), async (req, res, next) => {
  try {
    const { name, description, order } = req.body;

    const category = await prisma.category.create({
      data: {
        name,
        description,
        order: order || 0
      }
    });

    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
});

// Update category (admin only)
router.put('/:id', authMiddleware, requireRole('admin'), async (req, res, next) => {
  try {
    const { name, description, order } = req.body;

    const category = await prisma.category.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(order !== undefined && { order })
      }
    });

    res.json(category);
  } catch (error) {
    next(error);
  }
});

// Delete category (admin only)
router.delete('/:id', authMiddleware, requireRole('admin'), async (req, res, next) => {
  try {
    await prisma.category.delete({
      where: { id: parseInt(req.params.id) }
    });

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
