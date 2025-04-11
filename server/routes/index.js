
const express = require('express');
const router = express.Router();
const videoRoutes = require('./videoRoutes');

// Register all route handlers
router.use('/videos', videoRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
