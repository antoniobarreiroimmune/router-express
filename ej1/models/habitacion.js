const mongoose = require('mongoose');

const habitacionSchema = new mongoose.Schema({
    numeroHabitacion: { type: Number, required: true, unique: true },
    estaDisponible: { type: Boolean, required: true, default: true }
  });
  
  module.exports = mongoose.model('Habitacion', habitacionSchema);