const express = require('express');
const router = express.Router();
const Feeding = require('../models/feeding');
const logger = require('../utils/logger');
const { startOfDay, endOfDay, createLocalDate, createLocalTimestamp } = require('../utils/dateUtils');

// Get feedings for a baby with date filter
router.get('/baby/:babyId', async (req, res) => {
  try {
    const { date } = req.query;
    let query = { 
      babyId: req.params.babyId,
      isDeleted: { $ne: true }
    };
    
    if (date) {
      // Create start and end of day in local timezone
      const startDate = createLocalTimestamp(date, '00:00');
      const endDate = createLocalTimestamp(date, '23:59');
      
      query.timestamp = {
        $gte: startDate,
        $lte: endDate
      };

      logger.info('Date query parameters', { date, startDate, endDate });
    }

    const feedings = await Feeding.find(query)
      .sort({ timestamp: 1 });

    res.json(feedings);
  } catch (error) {
    logger.error('Error fetching feedings', { error });
    res.status(500).json({ message: error.message });
  }
});

// Add new feeding with custom timestamp
router.post('/', async (req, res) => {
  try {
    logger.info('Received feeding creation request', { requestBody: req.body });
    
    // Validate required fields based on type
    if (req.body.type === 'diaper' && !req.body.diaperType) {
      throw new Error('Diaper type is required for diaper records');
    }

    // If timestamp is provided in ISO format, use it directly
    let timestamp;
    if (req.body.timestamp) {
      timestamp = new Date(req.body.timestamp);
      if (isNaN(timestamp.getTime())) {
        throw new Error('Invalid timestamp format');
      }
    } else {
      // Otherwise create from date and time
      timestamp = createLocalTimestamp(req.body.date, req.body.time);
    }

    const feeding = new Feeding({
      babyId: req.body.babyId,
      timestamp: timestamp,
      type: req.body.type,
      volume: req.body.volume,
      duration: req.body.duration,
      diaperType: req.body.diaperType,
      notes: req.body.notes
    });

    const savedFeeding = await feeding.save();
    logger.info('Feeding record created successfully', { id: savedFeeding._id });
    res.status(201).json(savedFeeding);
  } catch (error) {
    logger.error('Error creating feeding', { 
      error: error.message,
      stack: error.stack 
    });
    res.status(400).json({ message: error.message });
  }
});

// Update a feeding record
router.put('/:id', async (req, res) => {
  try {
    const feeding = await Feeding.findById(req.params.id);
    if (!feeding) {
      return res.status(404).json({ message: 'Record not found' });
    }

    // Handle timestamp update
    if (req.body.timestamp) {
      const localTimestamp = new Date(req.body.timestamp);
      feeding.timestamp = localTimestamp;
    }

    // Update other fields
    if (req.body.type) feeding.type = req.body.type;
    if (req.body.volume) feeding.volume = req.body.volume;
    if (req.body.duration) feeding.duration = req.body.duration;
    if (req.body.notes !== undefined) feeding.notes = req.body.notes;

    const updatedFeeding = await feeding.save();
    res.json(updatedFeeding);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a single feeding record
router.delete('/:id', async (req, res) => {
  try {
    const feeding = await Feeding.findById(req.params.id);
    if (!feeding) {
      logger.warn('Feeding record not found for deletion', { id: req.params.id });
      return res.status(404).json({ message: 'Record not found' });
    }
    
    feeding.isDeleted = true;
    await feeding.save();
    
    logger.info('Feeding record deleted successfully', { id: req.params.id });
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    logger.error('Error deleting feeding record', { 
      error: error.message, 
      stack: error.stack,
      id: req.params.id 
    });
    res.status(500).json({ message: error.message });
  }
});

// Bulk delete feeding records
router.post('/bulk-delete', async (req, res) => {
  try {
    const { ids } = req.body;
    logger.info(`Attempting to bulk delete feeding records`, { ids });

    if (!ids || !Array.isArray(ids)) {
      logger.warn('Invalid bulk delete request - invalid ids format');
      return res.status(400).json({ message: 'Invalid request' });
    }

    const result = await Feeding.bulkDeleteByIds(ids);
    logger.info(`Bulk delete feeding result`, { result });

    res.json({ 
      message: 'Records deleted successfully',
      deletedCount: result.modifiedCount 
    });
  } catch (error) {
    logger.error('Error in bulk delete feeding', { 
      error: error.message,
      stack: error.stack 
    });
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 