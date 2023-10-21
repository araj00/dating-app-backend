const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  cafe: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Cafe'
  },
  startTime: {
    type: Date,
    required: true,
  },
  endTime: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Canceled'],
    default: 'Pending',
  },
  // Other fields specific to your model
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;