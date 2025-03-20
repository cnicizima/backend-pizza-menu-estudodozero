const request = require('supertest'); //request é o objeto supertest
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ errorFormat: 'minimal' });

const app = express();
const pizzasRoutes = require('../routes/pizzas') // Rotas que quero testar

app.use(express.json()); //para o express entender json
app.use('/api/pizzas', pizzasRoutes);

//criando a suite de teste que usa sintaxe do jest:

describe('Testa endpointes de pizzas', () => {

    beforeAll(async () => {
        await prisma.pizza.deleteMany({})//limpa a tabela antes de começar os testes
    })


    afterAll(async () => {
        await prisma.pizza.deleteMany({})//limpa a tabela depois de terminar os testes
    })

    //declarando payload do teste
    let pizza = { //criando objeto com o minimo do model para servir de payload para os testes
        "name": "Muçarela",
        "description": "Molho, tomate, muçarela",
        "price": 49.98
    };

    let pizzaId;

    //teste do post:
    it('testando POST /api/pizzas ', async () => {
        let response = await request(app).post('/api/pizzas').send(pizza)
        expect(response.statusCode).toBe(201);//testa o codigo de resposta
        expect(response.body.name).toBe(pizza.name);

        pizzaId = response.body.id; //salvando o id da pizza criada para usar no teste do get  
        pizza.price = "dez reais"; //alterando o valor para testar erro
        response = await request(app).post('/api/pizzas').send(pizza)
        expect(response.statusCode).toBe(400); //tem q conhecer o codigo e saber que o erro deveria ser 400
    })

    //teste do get

    it('testando GET /api/pizzas', async () => {
        let response = await request(app).get('/api/pizzas')
        expect(response.statusCode).toBe(200);
        expect(response.body.totalItems).toBe(1); //pq eu tenho controle do banco de dados no teste, inicialmente estava vazio, criei uma pizza no it anterior, entao só pode ter uma
        
        response = await request(app).get(`/api/pizzas/${pizzaId}`)
        expect(response.statusCode).toBe(200);

        response = await request(app).get(`/api/pizzas/${pizzaId + 1}`)
        expect(response.statusCode).toBe(400);
    })

    //teste para validar patch 

    it('testando PATCH /api/pizzas', async () => {
        pizza.price = 29.99;
        let response = await request(app).patch(`/api/pizzas/${pizzaId}`).send(pizza)
        expect(response.statusCode).toBe(200);
        expect(response.body.price).toBe(29.99);
        expect(response.body.price).not.toBe(49.98);
    })
})