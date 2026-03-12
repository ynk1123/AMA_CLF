const Appointment = require('../models/appointment');

exports.createAppointment = async (req, res) => {
  try {
    const { date, time, location, description, itemId } = req.body;
    const appointment = await Appointment.create({
      date,
      time,
      location,
      description,
      itemId,
      userId: req.user.id
    });
    res.status(201).json(appointment);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create appointment' });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll();
    res.json(appointments);
  } catch (err) {
    res.status(400).json({ message: 'Failed to retrieve appointments' });
  }
};