const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const mysql = require('mysql');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const port = 3000;

require('dotenv').config();

app.use(express.json());

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API de Usuarios",
            version: "1.0.0",
            description: "Documentación de API usando Swagger en Express"
        },
        servers: [
            { url: "http://localhost:3000" }
        ]
    },
    apis: ["./app.js"] // Ruta donde están tus archivos de rutas
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

connection.connect((err) => {
    if (err) {
        console.error('An error occurred while connecting to the DB');
        console.log(err);
    } else {
        console.log('Connected to the DB');
    }
});

app.get('/', (req, res) => {
    res.send('Hello World!')
});

app.get('/login', (req, res) => {
    const { username, password } = req.query;
    const sql = 'call verificarUsuario(?, ?, @estado)';
    connection.query(sql, [username, password], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'An error occurred while getting the user' });
        }
        connection.query('select @estado as estado', (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'An error occurred while getting the user' });
            } else {
                res.status(200).json(result[0]);
            }
        });
    });
});

app.post('/register', (req, res) => {
    const { username, password } = req.body;
    const sql = 'call registro(?, ?)';
    connection.query(sql, [username, password], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'An error occurred while registering the user' });
        }
        res.status(201).json({ message: 'User registered' });
    });
});

app.get('/obtenerTiposB', (req, res) => {
    const sql = 'call obtenerTipoImagen()';
    connection.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'An error occurred while getting the types' });
        }
        res.status(200).json(
            result[0]
        );
    });
});

app.post('/subirImagen', (req, res) => {
    const { tipoImagen, idUsuario, imagen } = req.body;

    const folder = path.join('C:/Users/Seito/Documents/Universidad/Semillero', 'Imagenes');

    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder);
    }

});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Swagger UI available at http://localhost:${port}/api-docs`);
});