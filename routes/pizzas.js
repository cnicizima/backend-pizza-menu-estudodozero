var express = require('express');
var router = express.Router();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({errorFormat: "minimal"});

const { exceptionHandler, fileHandler } = require('../utils/handlers');
const uploadSingle = require('../utils/uploadSingle');
const uploadPrivate = require('../utils/uploadPrivate');

/* GET /api/pizzas - Lista todas pizzas com paginação de 10 em 10. */
router.get('/', async function(req, res) {
  const ITEMS_PER_PAGE = 10;
  const page = Number(req.query.page) || 1;
  try {
    const pizzas = await prisma.pizza.findMany({
      take: ITEMS_PER_PAGE,
      skip: (page - 1) * ITEMS_PER_PAGE,
    });
    const totalItems = await prisma.pizza.count();
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    res.json({
      pizzas,
      page,
      totalPages,
      totalItems,
    });
  }
  catch (exception) {
    exceptionHandler(exception, res);
  }
});

/* POST /api/pizzas - Cria uma pizza */
router.post('/', uploadSingle, async (req, res) => { // arrow function
  const data = req.body; 
  console.log(data);

  const upload = req.upload || null;
  if (upload) {
    console.log(upload);
    data.image = upload.customPath;
  }
  try {
    const pizza = await prisma.pizza.create({
      data: data,
    });
    res.status(201).json(pizza);
  }
  catch (exception) {
    exceptionHandler(exception, res);
  }
});

/* GET /api/pizzas/{id} - Obtém uma pizza por id */
router.get('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const pizza = await prisma.pizza.findUniqueOrThrow({
      where: {
        id: id
      }
    });
    pizza.image = await fileHandler(req, pizza);
    res.json(pizza);
  }
  catch (exception) {
    exceptionHandler(exception, res);
  }
});


/* PATCH /api/pizzas/{id} - Atualiza uma pizza pelo id */
router.patch('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const data = req.body;
    const pizza = await prisma.pizza.update({
      where: {
        id: id
      },
      data: data,
    });
    res.json(pizza);
  }
  catch (exception) {
    exceptionHandler(exception, res);
  }
});

/* DELETE /api/pizzas/{id} - Exclui uma pizza por ID */
router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const pizza = await prisma.pizza.delete({
      where: {
        id: id
      }
    });
    res.status(204).end();  // 204 No content
    
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
