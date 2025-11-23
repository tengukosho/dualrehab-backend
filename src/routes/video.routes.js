const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware, requireRole } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/videos');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const thumbnailStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads/thumbnails');
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const videoUpload = multer({
  storage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp4|avi|mov|wmv|mkv/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Only video files are allowed'));
  }
});

const thumbnailUpload = multer({
  storage: thumbnailStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed for thumbnails'));
  }
});

// Get all videos
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { categoryId, difficultyLevel, page = 1, limit = 20 } = req.query;

    const where = {};
    if (categoryId) where.categoryId = parseInt(categoryId);
    if (difficultyLevel) where.difficultyLevel = difficultyLevel;

    const videos = await prisma.video.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      },
      skip: (page - 1) * limit,
      take: parseInt(limit),
      orderBy: { uploadDate: 'desc' }
    });

    const total = await prisma.video.count({ where });

    res.json({
      videos,
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

// Get video by ID
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const video = await prisma.video.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        category: true
      }
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    res.json(video);
  } catch (error) {
    next(error);
  }
});

// Upload video (admin only)
router.post('/',
  authMiddleware,
  requireRole('admin'),
  videoUpload.single('video'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Video file is required' });
      }

      const { title, description, categoryId, duration, difficultyLevel, instructions } = req.body;

      const videoUrl = `/uploads/videos/${req.file.filename}`;

      const video = await prisma.video.create({
        data: {
          title,
          description,
          categoryId: parseInt(categoryId),
          videoUrl,
          duration: parseInt(duration),
          difficultyLevel: difficultyLevel || 'beginner',
          instructions
        },
        include: {
          category: true
        }
      });

      res.status(201).json(video);
    } catch (error) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      next(error);
    }
  }
);

// Upload thumbnail (admin only)
router.post('/:id/thumbnail',
  authMiddleware,
  requireRole('admin'),
  thumbnailUpload.single('thumbnail'),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Thumbnail file is required' });
      }

      const thumbnailUrl = `/uploads/thumbnails/${req.file.filename}`;

      const video = await prisma.video.update({
        where: { id: parseInt(req.params.id) },
        data: { thumbnailUrl }
      });

      res.json(video);
    } catch (error) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      next(error);
    }
  }
);

// Update video (admin only)
router.put('/:id', authMiddleware, requireRole('admin'), async (req, res, next) => {
  try {
    const { title, description, categoryId, duration, difficultyLevel, instructions } = req.body;

    const video = await prisma.video.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(categoryId && { categoryId: parseInt(categoryId) }),
        ...(duration && { duration: parseInt(duration) }),
        ...(difficultyLevel && { difficultyLevel }),
        ...(instructions !== undefined && { instructions })
      },
      include: {
        category: true
      }
    });

    res.json(video);
  } catch (error) {
    next(error);
  }
});

// Delete video (admin only)
router.delete('/:id', authMiddleware, requireRole('admin'), async (req, res, next) => {
  try {
    const video = await prisma.video.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Delete files
    const videoPath = path.join(__dirname, '../..', video.videoUrl);
    if (fs.existsSync(videoPath)) {
      fs.unlinkSync(videoPath);
    }

    if (video.thumbnailUrl) {
      const thumbnailPath = path.join(__dirname, '../..', video.thumbnailUrl);
      if (fs.existsSync(thumbnailPath)) {
        fs.unlinkSync(thumbnailPath);
      }
    }

    await prisma.video.delete({
      where: { id: parseInt(req.params.id) }
    });

    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
