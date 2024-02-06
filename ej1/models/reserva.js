const mongoose = require('mongoose');

const reservaSchema = new mongoose.Schema({
  cliente: { type: mongoose.Schema.Types.ObjectId, ref: 'Cliente', required: true },
  habitacion: { type: Number, required: true, ref: 'Habitacion' },
  fechaCheckIn: { type: Date, required: true },
  fechaCheckOut: { type: Date, required: true }, 
  isActive: { type: Boolean, default: true } 
});

  
  module.exports = mongoose.model('Reserva', reservaSchema);