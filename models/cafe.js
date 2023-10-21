const mongoose = require('mongoose');

const cafeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  address: String,
  location: String,
  description: String,
  menu: [
    {
      item: String,
      price: Number,
    },
  ],
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
});

const Cafe = mongoose.model('Cafe', cafeSchema);

module.exports = Cafe;