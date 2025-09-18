import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import oracledb from 'oracledb';
import path from 'path'; // Adicionando path para lidar com caminhos
import router from '../sistema/routes/routes.js'; // Caminho corrigido para routes.js
import { initializeDB } from '../sistema/back-end/dbConnection.js'; // Caminho corrigido para dbConnection.js

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Configura a pasta "public" para servir arquivos estáticos
app.use(express.static(path.join(__dirname, '../sistema/front-end/public')));

// Configura a rota para servir o cadastro.html
app.get('/cadastro', (req, res) => {
    res.sendFile(path.join(__dirname, '../sistema/front-end/public/cadastro.html'));
});

// Configura as rotas
app.use(router);

// Inicializa o servidor e a conexão com o banco de dados
initializeDB().then(() => {
    app.listen(port, () => {
        console.log(`Servidor rodando em http://localhost:${port}`);
    });
}).catch((err) => {
    console.error('Erro ao inicializar o banco de dados:', err);
});