var express = require('express');
var router = express.Router();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({errorFormat: "minimal"});

const { exceptionHandler, fileHandler } = require('../utils/handlers');

/* GET /api/orders - Lista todos os pedidos com paginação de 10 em 10. */
router.get('/', async function(req, res) {
  const ITEMS_PER_PAGE = 10;
  const page = Number(req.query.page) || 1;
  try {
    const orders = await prisma.order.findMany({
      take: ITEMS_PER_PAGE,
      skip: (page - 1) * ITEMS_PER_PAGE,
    });
    const totalItems = await prisma.order.count();
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    res.json({
      orders,
      page,
      totalPages,
      totalItems,
    });
  }
  catch (exception) {
    exceptionHandler(exception, res);
  }
});

/* POST /api/orders - Cria um pedido de pizza */
router.post('/', async (req, res) => { // arrow function
  const data = req.body; 
  console.log(data);
  try {
    const order = await prisma.order.create({
      data: data,
    });
    res.status(201).json(order);
  }
  catch (exception) {
    exceptionHandler(exception, res);
  }
});

/* GET /api/orders/{id} - Obtém um pedido por id */
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const order = await prisma.order.findUniqueOrThrow({
      where: {
        id: id
      }
    });
    res.json(order);
  }
  catch (exception) {
    exceptionHandler(exception, res);
  }
});

// Resposta para rotas não existentes.
router.all('*', (req, res) => {
  res.status(501).end(); // 501 Not Implemented
});

module.exports = router;
