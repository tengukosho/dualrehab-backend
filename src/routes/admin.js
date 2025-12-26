// routes/admin.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Import auth middleware - FIXED: use authMiddleware instead of authenticate
const { authMiddleware } = require('../middleware/auth');

// Middleware to check admin/expert role
const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  if (req.user.role !== 'admin' && req.user.role !== 'expert') {
    return res.status(403).json({ error: 'Admin or Expert access required' });
  }
  next();
};

// Apply authentication to all admin routes
router.use(authMiddleware);

// GET /api/admin/stats - System-wide statistics
router.get('/stats', adminOnly, async (req, res) => {
  try {
    const totalCompletions = await prisma.userProgress.count();
    
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const completedLast7Days = await prisma.userProgress.count({
      where: { completionDate: { gte: sevenDaysAgo.toISOString() } }
    });
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const completedLast30Days = await prisma.userProgress.count({
      where: { completionDate: { gte: thirtyDaysAgo.toISOString() } }
    });
    
    const uniqueVideos = await prisma.userProgress.groupBy({
      by: ['videoId']
    });
    
    const totalUsers = await prisma.user.count();
    const totalPatients = await prisma.user.count({ where: { role: 'patient' } });
    const totalExperts = await prisma.user.count({ where: { role: 'expert' } });
    const totalAdmins = await prisma.user.count({ where: { role: 'admin' } });
    
    res.json({
      totalCompletions,
      completedLast7Days,
      completedLast30Days,
      uniqueVideosCompleted: uniqueVideos.length,
      totalUsers,
      totalPatients,
      totalExperts,
      totalAdmins
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/users - Get all users
router.get('/users', adminOnly, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        hospital: true,
        phoneNumber: true,
        medicalRecordNo: true,
        assignedExpertId: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/progress - Get all user progress
router.get('/progress', adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 100 } = req.query;
    const skip = (page - 1) * limit;
    
    const progress = await prisma.userProgress.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        video: { select: { id: true, title: true, categoryId: true } }
      },
      orderBy: { completionDate: 'desc' },
      take: parseInt(limit),
      skip: parseInt(skip)
    });
    
    const total = await prisma.userProgress.count();
    
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
    console.error('Get all progress error:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET /api/admin/schedules - Get all schedules
router.get('/schedules', adminOnly, async (req, res) => {
  try {
    const schedules = await prisma.schedule.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        video: { select: { id: true, title: true, duration: true, categoryId: true } }
      },
      orderBy: { scheduledDate: 'desc' }
    });
    
    res.json(schedules);
  } catch (error) {
    console.error('Get all schedules error:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/admin/users/:id - Update user
router.put('/users/:id', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, assignedExpertId, role, hospital, phoneNumber } = req.body;
    
    const updateData = {};
    if (assignedExpertId !== undefined) updateData.assignedExpertId = assignedExpertId;
    if (name !== undefined) updateData.name = name;
    if (role !== undefined) updateData.role = role;
    if (hospital !== undefined) updateData.hospital = hospital;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    
    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        hospital: true,
        phoneNumber: true,
        assignedExpertId: true
      }
    });
    
    res.json(user);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/admin/users/:id - Delete user
router.delete('/users/:id', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.userProgress.deleteMany({ where: { userId: parseInt(id) } });
    await prisma.schedule.deleteMany({ where: { userId: parseInt(id) } });
    await prisma.message.deleteMany({
      where: {
        OR: [
          { senderId: parseInt(id) },
          { receiverId: parseInt(id) }
        ]
      }
    });
    
    await prisma.user.delete({ where: { id: parseInt(id) } });
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
