const express = require('express');
const { ObjectId } = require('mongodb');

function filtrarProductosPorNombre(doc, categoria, nombres) {
    return doc[categoria].filter(producto => nombres.includes(producto.nombre));
}

module.exports = (db) => {
    const router = express.Router();
    const productosCollection = db.collection('productos');
    const pedidosCollection = db.collection('pedidos');

    const errorHandler = (err, req, res, next) => {
        console.error(err); 
        res.status(500).json({ status: "error", message: "Error interno del servidor" });
    };

    router.get('/productos', async (req, res, next) => {
        try {
            const findResult = await productosCollection.find({}).toArray();
            res.json(findResult);
        } catch (error) {
            next(error);
        }
    });

    router.post('/seleccion', async (req, res, next) => {
        const { menus = [], hamburguesas = [], bebidas = [], patatas = [] } = req.body;

        try {
            const doc = await productosCollection.findOne();
            if (!doc) {
                return res.status(404).json({ status: "error", message: "Productos no encontrados" });
            }

            let seleccionados = {
                menus: filtrarProductosPorNombre(doc, 'menus', menus),
                hamburguesas: filtrarProductosPorNombre(doc, 'hamburguesas', hamburguesas),
                bebidas: filtrarProductosPorNombre(doc, 'bebidas', bebidas),
                patatas: filtrarProductosPorNombre(doc, 'patatas', patatas),
            };

            const resultado = await pedidosCollection.insertOne({
                productosSeleccionados: seleccionados,
                fechaCreacion: new Date(),
                estado: "pendiente"
            });

            res.json({
                status: "success",
                message: "Pedido creado con éxito",
                pedidoId: resultado.insertedId
            });
        } catch (error) {
            next(error);
        }
    });

    router.put('/modificarSeleccion', async (req, res, next) => {
        const { pedidoId, menus = [], hamburguesas = [], bebidas = [], patatas = [] } = req.body;
    
        if (!ObjectId.isValid(pedidoId)) {
            return res.status(400).json({ status: "error", message: "ID de pedido inválido" });
        }
    
        try {
            const doc = await productosCollection.findOne();
            if (!doc) {
                return res.status(404).json({ status: "error", message: "Productos no encontrados" });
            }
    
            let productosAAnadir = {
                menus: filtrarProductosPorNombre(doc, 'menus', menus),
                hamburguesas: filtrarProductosPorNombre(doc, 'hamburguesas', hamburguesas),
                bebidas: filtrarProductosPorNombre(doc, 'bebidas', bebidas),
                patatas: filtrarProductosPorNombre(doc, 'patatas', patatas),
            };
    
            await pedidosCollection.updateOne(
                { _id: new ObjectId(pedidoId) },
                {
                    $push: {
                        "productosSeleccionados.menus": { $each: productosAAnadir.menus },
                        "productosSeleccionados.hamburguesas": { $each: productosAAnadir.hamburguesas },
                        "productosSeleccionados.bebidas": { $each: productosAAnadir.bebidas },
                        "productosSeleccionados.patatas": { $each: productosAAnadir.patatas }
                    }
                }
            );
    
            res.json({ status: "success", message: "Productos añadidos al pedido exitosamente" });
        } catch (error) {
            next(error);
        }
    });
    

    router.post('/finalizarPedido', async (req, res, next) => {
        const { pedidoId } = req.body;

        if (!ObjectId.isValid(pedidoId)) {
            return res.status(400).json({ status: "error", message: "ID de pedido inválido" });
        }

        try {
            const resultado = await pedidosCollection.updateOne(
                { _id: new ObjectId(pedidoId) },
                { $set: { estado: "finalizado" } }
            );

            if (resultado.modifiedCount === 0) {
                res.status(404).json({ status: "error", message: "Pedido no encontrado o ya finalizado" });
            } else {
                res.json({ status: "success", message: "Pedido finalizado con éxito" });
            }
        } catch (error) {
            next(error);
        }
    });

    router.use(errorHandler);

    return router;



};
