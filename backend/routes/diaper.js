const express = require('express');
const router = express.Router();
const Diaper = require('../models/diaper');
const logger = require('../utils/logger');

// Get diaper changes for a baby with date filter
router.get('/baby/:babyId', async (req, res) => {
  try {
    const { date } = req.query;
    let query = { 
      babyId: req.params.babyId,
      isDeleted: { $ne: true }
    };
    
    if (date) {
      // Create start and end dates in local timezone
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      query.timestamp = {
        $gte: startDate,
        $lte: endDate
      };
    }

    const diapers = await Diaper.find(query)
      .sort({ timestamp: 1 });
    res.json(diapers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new diaper change with custom timestamp
router.post('/', async (req, res) => {
  try {
    const { timestamp, ...rest } = req.body;
    // Create a new Date object from the ISO string in local timezone
    const localTimestamp = new Date(timestamp);
    
    const diaper = new Diaper({
      ...rest,
      timestamp: localTimestamp
    });

    const newDiaper = await diaper.save();
    res.status(201).json(newDiaper);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add this route to handle bulk delete
router.post('/bulk-delete', async (req, res) => {
  try {
    const { ids } = req.body;
    logger.info(`Attempting to bulk delete diaper records`, { ids });

    if (!ids || !Array.isArray(ids)) {
      logger.warn('Invalid bulk delete request - invalid ids format');
      return res.status(400).json({ message: 'Invalid request' });
    }

    const result = await Diaper.bulkDeleteByIds(ids);
    logger.info(`Bulk delete diaper result`, { result });

    res.json({ 
      message: 'Records deleted successfully',
      deletedCount: result.modifiedCount 
    });
  } catch (error) {
    logger.error('Error in bulk delete diaper', { 
      error: error.message,
      stack: error.stack 
    });
    res.status(500).json({ message: error.message });
  }
});

// Delete a single diaper record
router.delete('/:id', async (req, res) => {
    try {
        const diaper = await Diaper.findById(req.params.id);
        if (!diaper) {
            logger.warn('Diaper record not found for deletion', { id: req.params.id });
            return res.status(404).json({ message: 'Record not found' });
        }
        
        diaper.isDeleted = true;
        await diaper.save();
        
        logger.info('Diaper record deleted successfully', { id: req.params.id });
        res.json({ message: 'Record deleted successfully' });
    } catch (error) {
        logger.error('Error deleting diaper record', { 
            error: error.message, 
            stack: error.stack,
            id: req.params.id 
        });
        res.status(500).json({ message: error.message });
    }
});

module.exports = router; 