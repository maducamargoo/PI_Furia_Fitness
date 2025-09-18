import express from 'express';
import oracledb from 'oracledb';

const router = express.Router();

// Função de validação dos dados do aluno
function validateStudentData(data) {
    const { cpf, nome, sobrenome, data_nasc, email, telefone, genero, peso, altura } = data;
    const errors = [];

    if (!cpf) errors.push('CPF é obrigatório');
    if (!nome) errors.push('Nome é obrigatório');
    if (!sobrenome) errors.push('Sobrenome é obrigatório');
    if (!data_nasc) errors.push('Data de nascimento é obrigatória');
    if (!email) errors.push('Email é obrigatório');
    if (!telefone) errors.push('Telefone é obrigatório');
    if (peso && isNaN(peso)) errors.push('Peso deve ser um número');
    if (altura && isNaN(altura)) errors.push('Altura deve ser um número');

    return errors.length > 0 ? errors : null;
}

// Função de validação do login (verifica se o CPF existe)
function validateLoginData(cpf) {
    const errors = [];

    if (!cpf) errors.push('CPF é obrigatório');

    return errors.length > 0 ? errors : null;
}

// Função para cadastrar aluno
async function registerStudent(studentData, res) {
    let connection;
    try {
        connection = await oracledb.getConnection();

        // Verificando se o CPF ou email já estão cadastrados
        const existingStudent = await connection.execute(
            `SELECT COUNT(*) AS count FROM Aluno WHERE Cpf = :cpf OR Email = :email`,
            { cpf: studentData.cpf, email: studentData.email }
        );

        if (existingStudent.rows[0].COUNT > 0) {
            return res.status(400).json({ success: false, message: 'CPF ou email já cadastrado' });
        }

        // Inserindo o novo aluno no banco de dados
        await connection.execute(
            `INSERT INTO Aluno (Cpf, Nome, Sobrenome, Data_nasc, Email, Telefone, Genero, Peso, Altura) 
             VALUES (:cpf, :nome, :sobrenome, TO_DATE(:data_nasc, 'YYYY-MM-DD'), :email, :telefone, :genero, :peso, :altura)`,
            { 
                cpf: studentData.cpf, 
                nome: studentData.nome, 
                sobrenome: studentData.sobrenome, 
                data_nasc: studentData.data_nasc, 
                email: studentData.email, 
                telefone: studentData.telefone, 
                genero: studentData.genero,
                peso: studentData.peso,
                altura: studentData.altura
            },
            { autoCommit: true }
        );

        res.status(201).json({ success: true, message: 'Cadastro realizado com sucesso' });
    } catch (err) {
        console.error('Erro ao cadastrar aluno:', err);
        res.status(500).json({ success: false, message: 'Erro ao cadastrar aluno: ' + err.message });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Erro ao fechar a conexão:', err);
            }
        }
    }
}

// Rota de cadastro
router.post('/cadastrar-aluno', async (req, res) => {
    const studentData = req.body;
    const validationErrors = validateStudentData(studentData);
    
    if (validationErrors) {
        return res.status(400).json({ success: false, message: 'Dados inválidos: ' + validationErrors.join(', ') });
    }

    await registerStudent(studentData, res);
});

router.post('/cadastro', async (req, res) => {
    const { cpf, tipo } = req.body;

    let connection;
    try {
        connection = await oracledb.getConnection();

        // Verificar se o aluno existe
        const alunoCheck = await connection.execute(
            `SELECT COUNT(*) AS count FROM Aluno WHERE cpf = :cpf`,
            { cpf }
        );

        if (alunoCheck.rows[0].COUNT === 0) {
            return res.status(404).json({ success: false, message: 'Aluno não encontrado.' });
        }

        // Obter a última sessão registrada do aluno
        const ultimaSessao = await connection.execute(
            `SELECT entrada_saida 
             FROM Sessao 
             WHERE cpf_aluno = :cpf 
             ORDER BY data_hora DESC 
             FETCH FIRST 1 ROWS ONLY`,
            { cpf }
        );

        const ultimaEntradaSaida = ultimaSessao.rows.length > 0 ? ultimaSessao.rows[0].ENTRADA_SAIDA : null;

        // Lógica para entrada
        if (tipo === 'entrada') {
            if (ultimaEntradaSaida === 'E') {
                return res.status(400).json({
                    success: false,
                    message: 'Não é possível iniciar uma nova entrada sem encerrar a anterior.'
                });
            }

            // Registrar nova entrada
            await connection.execute(
                `INSERT INTO Sessao (entrada_saida, data_hora, cpf_aluno) 
                 VALUES ('E', CURRENT_TIMESTAMP, :cpf)`,
                { cpf },
                { autoCommit: true }
            );

            return res.status(201).json({
                success: true,
                message: 'Sessão de entrada registrada com sucesso.'
            });
        }

        // Lógica para saída
        if (tipo === 'saida') {
            if (ultimaEntradaSaida !== 'E') {
                return res.status(400).json({
                    success: false,
                    message: 'Não é possível encerrar uma sessão que não foi iniciada.'
                });
            }

            // Registrar saída
            await connection.execute(
                `INSERT INTO Sessao (entrada_saida, data_hora, cpf_aluno) 
                 VALUES ('S', CURRENT_TIMESTAMP, :cpf)`,
                { cpf },
                { autoCommit: true }
            );

            return res.status(201).json({
                success: true,
                message: 'Sessão de saída registrada com sucesso.'
            });
        }
    } catch (error) {
        console.error('Erro ao processar a solicitação:', error);
        res.status(500).json({ success: false, message: 'Erro interno no servidor.' });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Erro ao fechar a conexão:', err);
            }
        }
    }
});

// Função para fazer o login do aluno (verificando CPF)
async function loginStudent(cpf, res) {
    let connection;
    try {
        connection = await oracledb.getConnection();

        // Verificando se o CPF existe no banco
        const result = await connection.execute(
            `SELECT COUNT(*) AS count FROM Aluno WHERE Cpf = :cpf`,
            { cpf  }
        );

        if (result.rows[0].COUNT === 0) {
            return res.status(404).json({ success: false, message: 'CPF não encontrado' });
        }

        // Se o CPF existir, retorna sucesso
        res.status(200).json({ success: true, message: 'Login bem-sucedido' });
    } catch (err) {
        console.error('Erro ao realizar login:', err);
        res.status(500).json({ success: false, message: 'Erro ao realizar login' });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Erro ao fechar a conexão com o banco:', err);
            }
        }
    }
}

// Rota de login
router.post('/login', async (req, res) => {
    const { cpf } = req.body;
    
    if (!cpf) {
        return res.status(400).json({ 
            success: false, 
            message: 'CPF é obrigatório' 
        });
    }

    let connection;
    try {
        connection = await oracledb.getConnection();

        // Consulta para verificar se o CPF existe
        const result = await connection.execute(
            `SELECT Cpf FROM Aluno WHERE Cpf = :cpf`,
            { cpf },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        console.log('Resultado da consulta:', result.rows); // Debug

        if (!result.rows || result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'CPF não encontrado no sistema'
            });
        }

        // CPF encontrado
        res.status(200).json({
            success: true,
            message: 'Login bem-sucedido'
        });

    } catch (err) {
        console.error('Erro ao realizar login:', err);
        res.status(500).json({
            success: false,
            message: 'Erro ao realizar login'
        });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Erro ao fechar a conexão:', err);
            }
        }
    }
});

router.post('/verificar-cpf', async (req, res) => {
    const { cpf } = req.body;

    if (!cpf) {
        return res.status(400).json({ success: false, message: 'CPF é obrigatório.' });
    }

    let connection;
    try {
        connection = await oracledb.getConnection();

        // Consulta para verificar se o CPF existe
        const result = await connection.execute(
            `SELECT COUNT(*) AS count FROM Aluno WHERE Cpf = :cpf`,
            { cpf }
        );

        const isRegistered = result.rows[0].COUNT > 0;

        if (isRegistered) {
            res.json({ success: true, message: 'CPF encontrado.' });
        } else {
            res.json({ success: false, message: 'CPF não cadastrado.' });
        }
    } catch (err) {
        console.error('Erro ao verificar o CPF:', err);
        res.status(500).json({ success: false, message: 'Erro ao verificar o CPF.' });
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error('Erro ao fechar a conexão:', err);
            }
        }
    }
});

//Rotas da catraca---------------------------------------------------------------------------------------

router.post('/cadastro-catraca', async (req, res) => {
    const { cpf, tipo } = req.body;

    let connection;
    try {
        connection = await oracledb.getConnection();
        console.log("Conexão com o banco estabelecida.");

        // Verificar se o aluno existe
        const alunoCheck = await connection.execute(
            `SELECT COUNT(*) AS count FROM Aluno WHERE cpf = :cpf`,
            { cpf }
        );
        console.log("Resultado da verificação de aluno:", alunoCheck);

        if (alunoCheck.rows[0].COUNT === 0) {
            return res.status(404).json({ success: false, message: 'Aluno não encontrado.' });
        }

        // Obter a última sessão registrada do aluno
        const sessaoCheck = await connection.execute(
            `SELECT entrada_saida 
             FROM Secao 
             WHERE cpf_aluno = :cpf 
             ORDER BY data_hora DESC 
             FETCH FIRST 1 ROWS ONLY`,
            { cpf }
        );
        console.log("Resultado da verificação da última sessão:", sessaoCheck);

        const ultimaEntradaSaida = sessaoCheck.rows.length > 0 ? sessaoCheck.rows[0].ENTRADA_SAIDA : null;
        console.log("Última entrada/saída:", ultimaEntradaSaida);

        // Lógica para registrar a entrada
        if (tipo === 'E') {
            if (sessaoCheck.rows.length > 0 && sessaoCheck.rows[0].ENTRADA_SAIDA === 'E') {
                console.log("Erro: Não é possível iniciar uma nova entrada sem encerrar a anterior.");
                return res.status(400).json({ success: false, message: 'Não é possível iniciar uma nova sessão sem encerrar a anterior.' });
            }

            // Registrar nova entrada
            await connection.execute(
                `INSERT INTO Sessao (entrada_saida, data_hora, cpf_aluno) 
                 VALUES ('E', CURRENT_TIMESTAMP, :cpf)`,
                { cpf },
                { autoCommit: true }
            );
            console.log("Sessão de entrada registrada com sucesso.");

            return res.status(201).json({
                success: true,
                message: 'Sessão de entrada registrada com sucesso.'
            });
        }

        // Lógica para registrar a saída
        if (tipo === 'S') {
            if (ultimaEntradaSaida !== 'E') {
                return res.status(400).json({
                    success: false,
                    message: 'Não é possível encerrar uma sessão que não foi iniciada.'
                });
            }

            // Registrar saída
            await connection.execute(
                `INSERT INTO Sessao (entrada_saida, data_hora, cpf_aluno) 
                 VALUES ('S', CURRENT_TIMESTAMP, :cpf)`,
                { cpf },
                { autoCommit: true }
            );

            console.log("Sessão de saída registrada com sucesso.");

            return res.status(201).json({
                success: true,
                message: 'Sessão de saída registrada com sucesso.'
            });
        }

    } catch (error) {
        console.error('Erro ao processar a solicitação:', error);
        res.status(500).json({ success: false, message: 'Erro interno no servidor.' });
    } finally {
        if (connection) {
            try {
                await connection.close();
                console.log("Conexão com o banco fechada.");
            } catch (err) {
                console.error('Erro ao fechar a conexão:', err);
            }
        }
    }
});

export default router;
