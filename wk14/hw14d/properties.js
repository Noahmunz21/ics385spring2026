const express = require('express');
const router = express.Router();
const Property = require('../models/Property');

// GET all properties (with optional filters)
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.island) filter.island = req.query.island;
    if (req.query.minRating) filter['reviews.rating'] = { $gte: Number(req.query.minRating) };
    const properties = await Property.find(filter);
    res.render('properties', { properties });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single property by ID
router.get('/:id', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ error: 'Property not found' });
    res.json(property);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST a review to a property
router.post('/:id/reviews', async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ error: 'Property not found' });
    property.reviews.push(req.body);
    await property.save();
    res.status(201).json(property);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
