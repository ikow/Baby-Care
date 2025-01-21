const express = require('express');
const router = express.Router();
const Tip = require('../models/tip');

// Get all tips
router.get('/', async (req, res) => {
  try {
    const tips = await Tip.find().sort({ createdAt: -1 });
    res.json(tips);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add new tip
router.post('/', async (req, res) => {
  const tip = new Tip({
    userId: req.body.userId,
    title: req.body.title,
    content: req.body.content,
    category: req.body.category
  });

  try {
    const newTip = await tip.save();
    res.status(201).json(newTip);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 