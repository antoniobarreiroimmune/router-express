const express = require('express');
const router = express.Router();
const Cliente = require('../models/cliente');

router.post('/nuevoCliente', async (req, res) => {
  const { dni } = req.body;

  try {
    const clienteExistente = await Cliente.findOne({ dni });

    if (clienteExistente) {
      return res.status(400).send({ mensaje: 'El cliente con este DNI ya está registrado.' });
    }

    const nuevoCliente = new Cliente(req.body);
    await nuevoCliente.save();
    res.status(201).send(nuevoCliente);
  } catch (error) {
    res.status(400).send(error);
  }
});

router.put('/actualizarCliente/:dni', async (req, res) => {
  const { dni } = req.params;
  const { nombre, apellido } = req.body;

  try {
    const clienteActualizado = await Cliente.findOneAndUpdate(
      { dni },
      { nombre, apellido },
      { new: true, runValidators: true }
    );

    if (!clienteActualizado) {
      return res.status(404).send({ mensaje: 'Cliente no encontrado.' });
    }

    res.send({ mensaje: 'Cliente actualizado exitosamente.', cliente: clienteActualizado });
  } catch (error) {
    res.status(400).send(error);
  }
});


module.exports = router;
