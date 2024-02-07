const express = require('express');
const router = express.Router();
const Reserva = require('../models/reserva');
const Cliente = require('../models/cliente');
const Habitacion = require('../models/habitacion');

router.post('/checkin', async (req, res) => {
    const { dni, numeroHabitacion } = req.body;

    try {
        const cliente = await Cliente.findOne({ dni });
        if (!cliente) {
            return res.status(404).send({ mensaje: 'El cliente no está registrado.' });
        }

        const habitacion = await Habitacion.findOne({ numeroHabitacion, estaDisponible: true });
        if (!habitacion) {
            return res.status(400).send({ mensaje: 'La habitación no está disponible.' });
        }

        const nuevaReserva = new Reserva({
            cliente: cliente._id,
            habitacion: numeroHabitacion,
            fechaCheckIn: new Date(),
            isActive: true
        });

        await nuevaReserva.save();

        habitacion.estaDisponible = false;
        await habitacion.save();

        res.send({ mensaje: 'Check-in realizado con éxito.', reserva: nuevaReserva });
    } catch (error) {
        res.status(500).send({ mensaje: 'Error al realizar el check-in.', error: error.message });
    }
});


router.post('/checkout', async (req, res) => {
    const { dni } = req.body;

    try {
        const cliente = await Cliente.findOne({ dni });
        if (!cliente) {
            return res.status(404).send({ mensaje: 'Cliente no encontrado.' });
        }

        const reservaActualizada = await Reserva.findOneAndUpdate(
            { cliente: cliente._id, isActive: true },
            { $set: { isActive: false, fechaCheckOut: new Date() } },
            { new: true }
        );

        if (!reservaActualizada) {
            return res.status(404).send({ mensaje: 'Reserva activa no encontrada para el cliente.' });
        }

        const habitacion = await Habitacion.findOne({ numeroHabitacion: reservaActualizada.habitacion });
        if (habitacion) {
            habitacion.estaDisponible = true;
            await habitacion.save();
        }

        res.send({ mensaje: 'Checkout realizado con éxito, habitación disponible nuevamente.', reserva: reservaActualizada });
    } catch (error) {
        res.status(500).send({ mensaje: 'Error al realizar el checkout.', error: error.message });
    }
});


module.exports = router;
