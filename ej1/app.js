const express = require('express');
const mongoose = require('mongoose');
const clienteRoutes = require('./routes/clientesRoutes');
const reservasRoutes = require('./routes/reservasRoutes');

const app = express();
const port = 3000;

app.use(express.json());

mongoose.connect('mongodb://localhost/hotel')
.then(() => console.log('Conectado a MongoDB'))
.catch(err => console.error('No se pudo conectar a MongoDB', err));

app.locals.db = mongoose.connection;


app.use('/clientes', clienteRoutes);
app.use('/reservas', reservasRoutes);

app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
