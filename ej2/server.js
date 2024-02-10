const express = require('express');
const { MongoClient } = require('mongodb');
const app = express();
const port = 3000;
const url = 'mongodb://localhost:27017';
const dbName = 'prueba';

app.use(express.json());

async function main() {
  const client = new MongoClient(url);

  try {
    await client.connect();
    console.log("Conectado a MongoDB");
    const db = client.db(dbName);

    const routes = require('./routes/index')(db);
    app.use('/', routes);

    app.listen(port, () => {
      console.log(`Servidor escuchando en http://localhost:${port}`);
    });
  } catch (e) {
    console.error(e);
  }
}

main().catch(console.error);
