const express = require('express');
const router = express.Router();
const BodyData = require('../models/bodyData');
const { isAuthenticated } = require('../middleware/auth');

// Get all body data for a baby
router.get('/baby/:babyId', isAuthenticated, async (req, res) => {
    try {
        const { babyId } = req.params;
        const { startDate, endDate } = req.query;
        
        let query = { babyId };
        
        // Add date range filter if provided
        if (startDate || endDate) {
            query.date = {};
            if (startDate) {
                query.date.$gte = new Date(startDate);
            }
            if (endDate) {
                query.date.$lte = new Date(endDate);
            }
        }
        
        const bodyData = await BodyData.find(query).sort({ date: -1 });
        res.json(bodyData);
    } catch (error) {
        console.error('Error fetching body data:', error);
        res.status(500).json({ error: 'Failed to fetch body data' });
    }
});

// Add new body data
router.post('/', isAuthenticated, async (req, res) => {
    try {
        const { babyId, date, weight, height, notes } = req.body;
        
        if (!babyId || !date || weight === undefined || height === undefined) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        
        // Create new body data record
        const newBodyData = new BodyData({
            babyId,
            date: new Date(date),
            weight,
            height,
            notes: notes || ''
        });
        
        const savedBodyData = await newBodyData.save();
        res.status(201).json(savedBodyData);
    } catch (error) {
        console.error('Error adding body data:', error);
        res.status(500).json({ error: 'Failed to add body data' });
    }
});

// Update body data
router.put('/:id', isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const { date, weight, height, notes } = req.body;
        
        // Find and update the body data
        const updatedBodyData = await BodyData.findByIdAndUpdate(
            id,
            {
                date: date ? new Date(date) : undefined,
                weight,
                height,
                notes
            },
            { new: true, runValidators: true }
        );
        
        if (!updatedBodyData) {
            return res.status(404).json({ error: 'Body data not found' });
        }
        
        res.json(updatedBodyData);
    } catch (error) {
        console.error('Error updating body data:', error);
        res.status(500).json({ error: 'Failed to update body data' });
    }
});

// Delete body data
router.delete('/:id', isAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        
        // Find and delete the body data
        const deletedBodyData = await BodyData.findByIdAndDelete(id);
        
        if (!deletedBodyData) {
            return res.status(404).json({ error: 'Body data not found' });
        }
        
        res.json({ message: 'Body data deleted successfully' });
    } catch (error) {
        console.error('Error deleting body data:', error);
        res.status(500).json({ error: 'Failed to delete body data' });
    }
});

module.exports = router; 