const express = require('express');
const router = express.Router();
const Appointment = require('../models/appointment');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// Create appointment
router.post('/', authenticate, async (req, res) => {
  try {
    const { date, time, location, description } = req.body;
    const appointment = await Appointment.create({
      date,
      time,
      location,
      description,
      userId: req.user.id,
      status: 'pending'
    });
    res.status(201).json(appointment);
  } catch (err) {
    console.error('Error creating appointment:', err);
    res.status(400).json({ message: 'Failed to create appointment', error: err.message });
  }
});

// Get all appointments (admin only)
router.get('/', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(appointments);
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(400).json({ message: 'Failed to fetch appointments', error: err.message });
  }
});

// Get current user's appointments only
router.get('/my-appointments', authenticate, async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(appointments);
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(400).json({ message: 'Failed to fetch appointments', error: err.message });
  }
});

// Update appointment status
router.put('/:id/status', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    
    appointment.status = status;
    await appointment.save();
    res.json(appointment);
  } catch (err) {
    console.error('Error updating appointment:', err);
    res.status(400).json({ message: 'Failed to update appointment status', error: err.message });
  }
});

// Delete appointment (admin only)
router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    await appointment.destroy();
    res.json({ message: 'Appointment deleted' });
  } catch (err) {
    console.error('Error deleting appointment:', err);
    res.status(400).json({ message: 'Failed to delete appointment', error: err.message });
  }
});

module.exports = router;
