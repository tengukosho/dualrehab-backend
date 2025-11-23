const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get user's messages (inbox)
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: req.user.id },
          { receiverId: req.user.id }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      },
      skip: (page - 1) * limit,
      take: parseInt(limit),
      orderBy: { timestamp: 'desc' }
    });

    const total = await prisma.message.count({
      where: {
        OR: [
          { senderId: req.user.id },
          { receiverId: req.user.id }
        ]
      }
    });

    res.json({
      messages,
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

// Get conversation with specific user
router.get('/conversation/:userId', authMiddleware, async (req, res, next) => {
  try {
    const otherUserId = parseInt(req.params.userId);

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: req.user.id, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: req.user.id }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      },
      orderBy: { timestamp: 'asc' }
    });

    // Mark messages as read
    await prisma.message.updateMany({
      where: {
        senderId: otherUserId,
        receiverId: req.user.id,
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    res.json(messages);
  } catch (error) {
    next(error);
  }
});

// Get unread message count
router.get('/unread/count', authMiddleware, async (req, res, next) => {
  try {
    const count = await prisma.message.count({
      where: {
        receiverId: req.user.id,
        isRead: false
      }
    });

    res.json({ count });
  } catch (error) {
    next(error);
  }
});

// Send message
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { receiverId, message: messageText } = req.body;

    if (!messageText || !messageText.trim()) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    const message = await prisma.message.create({
      data: {
        senderId: req.user.id,
        receiverId: parseInt(receiverId),
        message: messageText.trim()
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            role: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            role: true
          }
        }
      }
    });

    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
});

// Mark message as read
router.put('/:id/read', authMiddleware, async (req, res, next) => {
  try {
    const message = await prisma.message.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.receiverId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updatedMessage = await prisma.message.update({
      where: { id: parseInt(req.params.id) },
      data: { isRead: true }
    });

    res.json(updatedMessage);
  } catch (error) {
    next(error);
  }
});

// Mark all messages from a user as read
router.put('/conversation/:userId/read-all', authMiddleware, async (req, res, next) => {
  try {
    const otherUserId = parseInt(req.params.userId);

    await prisma.message.updateMany({
      where: {
        senderId: otherUserId,
        receiverId: req.user.id,
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    res.json({ message: 'All messages marked as read' });
  } catch (error) {
    next(error);
  }
});

// Delete message
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const message = await prisma.message.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.senderId !== req.user.id && message.receiverId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.message.delete({
      where: { id: parseInt(req.params.id) }
    });

    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
