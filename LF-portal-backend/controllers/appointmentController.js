const Appointment = require('../models/appointment');

exports.createAppointment = async (req, res) => {
  try {
    const { date, time, location, description } = req.body;
    const appointment = await Appointment.create({
      date,
      time,
      location,
      description,
      userId: req.user.id
    });
    res.status(201).json(appointment);
  } catch (err) {
    res.status(400).json({ message: 'Failed to create appointment' });
  }
};

exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      order: [['date', 'DESC'], ['time', 'DESC']]
    });
    res.json(appointments);
  } catch (err) {
    res.status(400).json({ message: 'Failed to fetch appointments' });
  }
};

exports.updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    
    appointment.status = status;
    await appointment.save();
    res.json(appointment);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update appointment status' });
  }
};