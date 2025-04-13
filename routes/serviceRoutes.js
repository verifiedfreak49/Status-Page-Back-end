const express = require('express');
const router = express.Router();

// Import controller functions for service management
const {
  getAllServices,
  createService,
  updateServiceStatus,
  deleteService
} = require('../controllers/serviceController');

// Route: GET /api/services
// Description: Fetch all services
router.get('/', getAllServices);

// Route: POST /api/services
// Description: Create a new service
router.post('/', createService);

// Route: PUT /api/services/:id
// Description: Update the status of a specific service
router.put('/:id', updateServiceStatus);

// Route: DELETE /api/services/:id
// Description: Delete a specific service
router.delete('/:id', deleteService);

// Import subscriber model for email notifications
const Subscriber = require('../models/Subscriber');

// Route: POST /api/services/subscribe
// Description: Subscribe a user to a specific service for notifications
router.post('/subscribe', async (req, res) => {
  const { email, serviceId } = req.body;

  // Validate request body
  if (!email || !serviceId) {
    return res.status(400).json({ message: 'Email and Service ID required' });
  }

  try {
    // Check for duplicate subscription
    const existing = await Subscriber.findOne({ email, serviceId });
    if (existing) {
      return res.status(200).json({ message: 'Already subscribed' });
    }

    // Create new subscription
    const newSub = new Subscriber({ email, serviceId });
    await newSub.save();

    res.status(201).json({ message: 'Subscribed successfully' });
  } catch (err) {
    console.error('Subscription error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
