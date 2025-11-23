const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Get user's hardware data
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const { dataType, startDate, endDate, page = 1, limit = 20 } = req.query;

    const where = {
      userId: req.user.id
    };

    if (dataType) where.dataType = dataType;

    if (startDate || endDate) {
      where.sessionDate = {};
      if (startDate) where.sessionDate.gte = new Date(startDate);
      if (endDate) where.sessionDate.lte = new Date(endDate);
    }

    const hardwareData = await prisma.hardwareData.findMany({
      where,
      skip: (page - 1) * limit,
      take: parseInt(limit),
      orderBy: { sessionDate: 'desc' }
    });

    const total = await prisma.hardwareData.count({ where });

    res.json({
      hardwareData,
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

// Get hardware data by ID
router.get('/:id', authMiddleware, async (req, res, next) => {
  try {
    const data = await prisma.hardwareData.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!data) {
      return res.status(404).json({ error: 'Hardware data not found' });
    }

    if (data.userId !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'expert') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Record hardware data
router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const { dataType, dataValue, notes } = req.body;

    if (!dataType || !dataValue) {
      return res.status(400).json({ error: 'dataType and dataValue are required' });
    }

    // Validate JSON if it's a string
    let parsedData;
    try {
      parsedData = typeof dataValue === 'string' ? JSON.parse(dataValue) : dataValue;
    } catch {
      return res.status(400).json({ error: 'dataValue must be valid JSON' });
    }

    const hardwareData = await prisma.hardwareData.create({
      data: {
        userId: req.user.id,
        dataType,
        dataValue: JSON.stringify(parsedData),
        notes
      }
    });

    res.status(201).json(hardwareData);
  } catch (error) {
    next(error);
  }
});

// Batch record hardware data
router.post('/batch', authMiddleware, async (req, res, next) => {
  try {
    const { records } = req.body;

    if (!Array.isArray(records) || records.length === 0) {
      return res.status(400).json({ error: 'records must be a non-empty array' });
    }

    const dataToCreate = records.map(record => ({
      userId: req.user.id,
      dataType: record.dataType,
      dataValue: typeof record.dataValue === 'string' 
        ? record.dataValue 
        : JSON.stringify(record.dataValue),
      notes: record.notes,
      sessionDate: record.sessionDate ? new Date(record.sessionDate) : new Date()
    }));

    const result = await prisma.hardwareData.createMany({
      data: dataToCreate
    });

    res.status(201).json({
      message: 'Hardware data recorded successfully',
      count: result.count
    });
  } catch (error) {
    next(error);
  }
});

// Get hardware data statistics
router.get('/stats/summary', authMiddleware, async (req, res, next) => {
  try {
    const { dataType, days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const where = {
      userId: req.user.id,
      sessionDate: {
        gte: startDate
      }
    };

    if (dataType) where.dataType = dataType;

    const data = await prisma.hardwareData.findMany({
      where,
      orderBy: { sessionDate: 'asc' }
    });

    // Group by data type
    const groupedByType = data.reduce((acc, item) => {
      if (!acc[item.dataType]) {
        acc[item.dataType] = [];
      }
      acc[item.dataType].push({
        date: item.sessionDate,
        value: JSON.parse(item.dataValue)
      });
      return acc;
    }, {});

    res.json({
      totalRecords: data.length,
      dataTypes: Object.keys(groupedByType),
      data: groupedByType
    });
  } catch (error) {
    next(error);
  }
});

// Delete hardware data
router.delete('/:id', authMiddleware, async (req, res, next) => {
  try {
    const data = await prisma.hardwareData.findUnique({
      where: { id: parseInt(req.params.id) }
    });

    if (!data) {
      return res.status(404).json({ error: 'Hardware data not found' });
    }

    if (data.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    await prisma.hardwareData.delete({
      where: { id: parseInt(req.params.id) }
    });

    res.json({ message: 'Hardware data deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
