const express = require('express');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const mysql = require('mysql');
const jwt = require('jsonwebtoken');

const cors = require('cors');
const app = express();
const port = 3000;

require('dotenv').config();

app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cors());

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

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const sql = 'call verificarUsuario(?, ?, @estado, @rolUsuario)';
    connection.query(sql, [username, password], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'An error occurred while getting the user' });
        }
        connection.query('select @estado as estado, @rolUsuario as rol', (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'An error occurred while getting the user' });
            } else {
                if (!result[0].estado) {
                    return res.status(401).json({ message: 'User not found' });
                } else {
                    const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
                    res.status(200).json({rol: result[0].rol, token});
                }
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
    const { tipImagen, usuarioName, imagen } = req.body;
    const sql = 'call cargarImagen(?, ?, ?)';
    connection.query(sql, [usuarioName, imagen, tipImagen], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ message: 'An error occurred while uploading the image' });
        }
        res.status(201).json({ message: 'Image uploaded' });
    });

});

app.get('/obtenerInfoImages', (req, res) => {
    const sql = 'call obtenerInfoImagenes()';
    connection.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'An error occurred while getting the images' });
        }
        res.status(200).json(
            result[0]
        );
    });
});

app.post('/cambiarTipoImagen', (req, res) => {
    const { idImagen, tipoImagen } = req.body;

    const sql = 'call cambiarTipoImagen(?, ?)';
    connection.query(sql, [idImagen, tipoImagen], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'An error occurred while changing the image type' });
        }
        res.status(201).json({ message: 'Image type changed' });
    });
});

app.post('/validarImagen', (req, res) => {
    const { idImagen } = req.body;

    const sql = 'call validarImagen(?)';
    connection.query(sql, [idImagen], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'An error occurred while validating the image' });
        }
        res.status(201).json({ message: 'Image validated' });
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Swagger UI available at http://localhost:${port}/api-docs`);
});