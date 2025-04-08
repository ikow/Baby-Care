const express = require('express');
const router = express.Router();
const Baby = require('../models/baby');

// Create new baby
router.post('/', async (req, res) => {
  const baby = new Baby({
    name: req.body.name,
    dateOfBirth: req.body.dateOfBirth,
    gender: req.body.gender,
    parentId: req.body.parentId
  });

  try {
    const newBaby = await baby.save();
    res.status(201).json(newBaby);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all babies
router.get('/', async (req, res) => {
  try {
    const babies = await Baby.find();
    res.json(babies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get baby by ID
router.get('/:id', async (req, res) => {
  try {
    const baby = await Baby.findById(req.params.id);
    if (baby) {
      res.json(baby);
    } else {
      res.status(404).json({ message: 'Baby not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 