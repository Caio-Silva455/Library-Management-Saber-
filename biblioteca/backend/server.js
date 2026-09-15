const express = require('express');
const sql = require('mssql');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// ─── CONFIGURAÇÃO DO BANCO ────────────────────────────────────────────────────

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    port: parseInt(process.env.DB_PORT) || 1433,
    database: process.env.DB_NAME,
    options: { encrypt: true, trustServerCertificate: true }
};

let pool;
async function getPool() {
    if (!pool) pool = await sql.connect(config);
    return pool;
}

async function execSP(spName, paramsFn) {
    const pool = await getPool();
    const req = pool.request();
    if (paramsFn) paramsFn(req);
    return await req.execute(spName);
}

// ─── GETs ─────────────────────────────────────────────────────────────────────

app.get('/alunos', async (req, res) => {
    try {
        const pool = await getPool();
        const termo = req.query.busca;
        let querySQL = 'SELECT id, nome, cpf, telefone, email, turma, data_nascimento, idEndereco FROM Aluno';
        const request = pool.request();
        if (termo) {
            querySQL += ' WHERE nome LIKE @filtro OR cpf LIKE @filtro';
            request.input('filtro', sql.VarChar, `%${termo}%`);
        }
        querySQL += ' ORDER BY id DESC';
        const result = await request.query(querySQL);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.get('/alunos/:id', async (req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('id', sql.Int, parseInt(req.params.id))
            .query('SELECT id, nome, cpf, telefone, email, turma, data_nascimento, idEndereco FROM Aluno WHERE id = @id');
        if (!result.recordset.length) return res.status(404).json({ erro: 'Aluno não encontrado' });
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.get('/livros', async (req, res) => {
    try {
        const pool = await getPool();
        const termo = req.query.busca;
        let querySQL = 'SELECT id, titulo, idioma, isbn, idEditora FROM Livro';
        const request = pool.request();
        if (termo) {
            querySQL += ' WHERE titulo LIKE @filtro OR isbn LIKE @filtro';
            request.input('filtro', sql.VarChar, `%${termo}%`);
        }
        querySQL += ' ORDER BY id DESC';
        const result = await request.query(querySQL);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.get('/livros/:id', async (req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('id', sql.Int, parseInt(req.params.id))
            .query('SELECT id, titulo, idioma, isbn, idEditora FROM Livro WHERE id = @id');
        if (!result.recordset.length) return res.status(404).json({ erro: 'Livro não encontrado' });
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.get('/autores', async (req, res) => {
    try {
        const pool = await getPool();
        const termo = req.query.busca || req.query.nome;
        let querySQL = 'SELECT id, nome FROM Autor';
        const request = pool.request();
        if (termo) {
            querySQL += ' WHERE nome LIKE @filtro';
            request.input('filtro', sql.VarChar, `%${termo}%`);
        }
        querySQL += ' ORDER BY id DESC';
        const result = await request.query(querySQL);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.get('/autores/:id', async (req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('id', sql.Int, parseInt(req.params.id))
            .query('SELECT id, nome FROM Autor WHERE id = @id');
        if (!result.recordset.length) return res.status(404).json({ erro: 'Autor não encontrado' });
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.get('/exemplares', async (req, res) => {
    try {
        const pool = await getPool();
        const termo = req.query.busca;
        let querySQL = `
            SELECT 
                e.id, 
                e.numero_exemplar, 
                e.idLivro, 
                l.titulo AS titulo_livro,
                e.status AS status_exemplar
            FROM Exemplar e
            INNER JOIN Livro l ON e.idLivro = l.id
        `;
        const request = pool.request();
        if (termo) {
            querySQL += ' WHERE l.titulo LIKE @filtro';
            request.input('filtro', sql.VarChar, `%${termo}%`);
        }
        querySQL += ' ORDER BY e.id DESC';
        const result = await request.query(querySQL);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.get('/exemplares/:id', async (req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('id', sql.Int, parseInt(req.params.id))
            .query(`
                SELECT e.id, e.numero_exemplar, e.idLivro, l.titulo AS titulo_livro, e.status AS status_exemplar
                FROM Exemplar e INNER JOIN Livro l ON e.idLivro = l.id
                WHERE e.id = @id
            `);
        if (!result.recordset.length) return res.status(404).json({ erro: 'Exemplar não encontrado' });
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.get('/editoras', async (req, res) => {
    try {
        const pool = await getPool();
        const termo = req.query.busca;
        let querySQL = 'SELECT id, nome FROM Editora';
        const request = pool.request();
        if (termo) {
            querySQL += ' WHERE nome LIKE @filtro';
            request.input('filtro', sql.VarChar, `%${termo}%`);
        }
        querySQL += ' ORDER BY id DESC';
        const result = await request.query(querySQL);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.get('/editoras/:id', async (req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('id', sql.Int, parseInt(req.params.id))
            .query('SELECT id, nome FROM Editora WHERE id = @id');
        if (!result.recordset.length) return res.status(404).json({ erro: 'Editora não encontrada' });
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.get('/estados', async (req, res) => {
    try {
        const pool = await getPool();
        const termo = req.query.busca;
        let querySQL = 'SELECT id, nome FROM Estado';
        const request = pool.request();
        if (termo) {
            querySQL += ' WHERE nome LIKE @filtro';
            request.input('filtro', sql.VarChar, `%${termo}%`);
        }
        querySQL += ' ORDER BY nome ASC';
        const result = await request.query(querySQL);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.get('/estados/:id', async (req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('id', sql.Int, parseInt(req.params.id))
            .query('SELECT id, nome FROM Estado WHERE id = @id');
        if (!result.recordset.length) return res.status(404).json({ erro: 'Estado não encontrado' });
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.get('/cidades', async (req, res) => {
    try {
        const pool = await getPool();
        const termo = req.query.busca;
        let querySQL = 'SELECT id, nome, idEstado FROM Cidade';
        const request = pool.request();
        if (termo) {
            querySQL += ' WHERE nome LIKE @filtro';
            request.input('filtro', sql.VarChar, `%${termo}%`);
        }
        querySQL += ' ORDER BY nome ASC';
        const result = await request.query(querySQL);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.get('/cidades/:id', async (req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('id', sql.Int, parseInt(req.params.id))
            .query('SELECT id, nome, idEstado FROM Cidade WHERE id = @id');
        if (!result.recordset.length) return res.status(404).json({ erro: 'Cidade não encontrada' });
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.get('/enderecos', async (req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request().query(
            'SELECT id, cep, logradouro, bairro, complemento, idCidade FROM Endereco ORDER BY id DESC'
        );
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.get('/enderecos/:id', async (req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('id', sql.Int, parseInt(req.params.id))
            .query('SELECT id, cep, logradouro, bairro, complemento, idCidade FROM Endereco WHERE id = @id');
        if (!result.recordset.length) return res.status(404).json({ erro: 'Endereço não encontrado' });
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.get('/areas-conhecimento', async (req, res) => {
    try {
        const pool = await getPool();
        const termo = req.query.busca;
        let querySQL = 'SELECT id, nome FROM Area_Conhecimento';
        const request = pool.request();
        if (termo) {
            querySQL += ' WHERE nome LIKE @filtro';
            request.input('filtro', sql.VarChar, `%${termo}%`);
        }
        querySQL += ' ORDER BY id DESC';
        const result = await request.query(querySQL);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.get('/areas-conhecimento/:id', async (req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('id', sql.Int, parseInt(req.params.id))
            .query('SELECT id, nome FROM Area_Conhecimento WHERE id = @id');
        if (!result.recordset.length) return res.status(404).json({ erro: 'Área de conhecimento não encontrada' });
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.get('/exemplar-emprestado', async (req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request().query(`
            SELECT 
                ee.id,
                ee.idAluno,
                ee.idExemplar,
                ee.dataEmprestimo,
                ee.dataDevolucaoPrevista,
                ee.dataDevolucao,
                al.nome AS nomeAluno
            FROM Exemplar_Emprestado ee
            INNER JOIN Aluno al ON ee.idAluno = al.id
            ORDER BY ee.id DESC
        `);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.get('/exemplar-emprestado/:id', async (req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('id', sql.Int, parseInt(req.params.id))
            .query(`
                SELECT ee.id, ee.idAluno, ee.idExemplar, ee.dataEmprestimo,
                       ee.dataDevolucaoPrevista, ee.dataDevolucao, al.nome AS nomeAluno
                FROM Exemplar_Emprestado ee
                INNER JOIN Aluno al ON ee.idAluno = al.id
                WHERE ee.id = @id
            `);
        if (!result.recordset.length) return res.status(404).json({ erro: 'Empréstimo não encontrado' });
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.get('/historico', async (req, res) => {
    try {
        const pool = await getPool();
        const termo = req.query.busca;
        let querySQL = `
            SELECT 
                h.id, 
                h.data_emprestimo, 
                h.data_devolucao, 
                h.data_pagamento_multa, 
                h.descricao, 
                h.idExemplarEmprestado,
                al.nome AS nome_aluno, 
                liv.titulo AS titulo_livro
            FROM Historico h
            INNER JOIN Exemplar_Emprestado ee ON h.idExemplarEmprestado = ee.id
            INNER JOIN Aluno al ON ee.idAluno = al.id
            INNER JOIN Exemplar ex ON ee.idExemplar = ex.id
            INNER JOIN Livro liv ON ex.idLivro = liv.id
        `;
        const request = pool.request();
        if (termo) {
            querySQL += ' WHERE al.nome LIKE @filtro OR liv.titulo LIKE @filtro';
            request.input('filtro', sql.VarChar, `%${termo}%`);
        }
        querySQL += ' ORDER BY h.id DESC';
        const result = await request.query(querySQL);
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.get('/historico/:id', async (req, res) => {
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('id', sql.Int, parseInt(req.params.id))
            .query(`
                SELECT h.id, h.data_emprestimo, h.data_devolucao, h.data_pagamento_multa,
                       h.descricao, h.idExemplarEmprestado,
                       al.nome AS nome_aluno, liv.titulo AS titulo_livro
                FROM Historico h
                INNER JOIN Exemplar_Emprestado ee ON h.idExemplarEmprestado = ee.id
                INNER JOIN Aluno al ON ee.idAluno = al.id
                INNER JOIN Exemplar ex ON ee.idExemplar = ex.id
                INNER JOIN Livro liv ON ex.idLivro = liv.id
                WHERE h.id = @id
            `);
        if (!result.recordset.length) return res.status(404).json({ erro: 'Histórico não encontrado' });
        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// ─── POSTs ────────────────────────────────────────────────────────────────────

app.post('/alunos', async (req, res) => {
    const { nome, cpf, telefone, email, turma, data_nascimento, idEndereco } = req.body;
    if (!nome || !cpf || !telefone || !data_nascimento || !idEndereco)
        return res.status(400).json({ erro: 'nome, cpf, telefone, data_nascimento e idEndereco são obrigatórios' });
    try {
        await execSP('sp_InserirAluno', r =>
            r.input('nome', sql.VarChar(100), nome)
             .input('cpf', sql.VarChar(14), cpf)
             .input('telefone', sql.VarChar(20), telefone)
             .input('email', sql.VarChar(100), email ?? null)
             .input('turma', sql.VarChar(15), turma ?? null)
             .input('data_nascimento', sql.Date, data_nascimento)
             .input('idEndereco', sql.Int, idEndereco)
        );
        res.status(201).json({ mensagem: 'Aluno cadastrado com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.post('/livros', async (req, res) => {
    const { titulo, idioma, anoPublicacao, isbn, idEditora } = req.body;
    if (!titulo) return res.status(400).json({ erro: 'titulo é obrigatório' });
    try {
        await execSP('sp_InserirLivro', r =>
            r.input('titulo', sql.VarChar(255), titulo)
             .input('idioma', sql.VarChar(100), idioma ?? null)
             .input('anoPublicacao', sql.Date, anoPublicacao ?? null)
             .input('isbn', sql.VarChar(13), isbn ?? null)
             .input('idEditora', sql.Int, idEditora ?? null)
        );
        res.status(201).json({ mensagem: `Livro '${titulo}' cadastrado com sucesso!` });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.post('/autores', async (req, res) => {
    const nome = req.body.nome || req.body.nome_autor;
    if (!nome) return res.status(400).json({ erro: 'O campo nome é obrigatório' });
    try {
        await execSP('sp_InserirAutor', r =>
            r.input('nome_autor', sql.VarChar(255), nome)
        );
        res.status(201).json({ mensagem: `Autor '${nome}' inserido com sucesso!` });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.post('/autor-livro', async (req, res) => {
    const { idAutor, idLivro } = req.body;
    if (!idAutor || !idLivro) return res.status(400).json({ erro: 'idAutor e idLivro são obrigatórios' });
    try {
        await execSP('sp_InserirAutorLivro', r =>
            r.input('idAutor', sql.Int, idAutor)
             .input('idLivro', sql.Int, idLivro)
        );
        res.status(201).json({ mensagem: 'Autor vinculado ao livro com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.post('/area-livro', async (req, res) => {
    const { idArea, idLivro } = req.body;
    if (!idArea || !idLivro) return res.status(400).json({ erro: 'idArea e idLivro são obrigatórios' });
    try {
        await execSP('sp_InserirAreaLivro', r =>
            r.input('idArea', sql.Int, idArea)
             .input('idLivro', sql.Int, idLivro)
        );
        res.status(201).json({ mensagem: 'Área vinculada ao livro com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.post('/editoras', async (req, res) => {
    const { nome } = req.body;
    if (!nome) return res.status(400).json({ erro: 'nome é obrigatório' });
    try {
        await execSP('sp_InserirEditora', r =>
            r.input('nome', sql.VarChar(100), nome)
        );
        res.status(201).json({ mensagem: `Editora '${nome}' inserida com sucesso!` });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.post('/estados', async (req, res) => {
    const { nome } = req.body;
    if (!nome) return res.status(400).json({ erro: 'nome é obrigatório' });
    try {
        await execSP('sp_InserirEstado', r =>
            r.input('nome', sql.VarChar(100), nome)
        );
        res.status(201).json({ mensagem: `Estado '${nome}' inserido com sucesso!` });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.post('/cidades', async (req, res) => {
    const { nome, idEstado } = req.body;
    if (!nome || !idEstado) return res.status(400).json({ erro: 'nome e idEstado são obrigatórios' });
    try {
        await execSP('sp_InserirCidade', r =>
            r.input('nome', sql.VarChar(200), nome)
             .input('idEstado', sql.Int, idEstado)
        );
        res.status(201).json({ mensagem: `Cidade '${nome}' inserida com sucesso!` });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.post('/enderecos', async (req, res) => {
    const { cep, logradouro, bairro, complemento } = req.body;
    const idcidade = req.body.idCidade || req.body.idcidade;
    if (!cep || !logradouro || !bairro || !idcidade)
        return res.status(400).json({ erro: 'cep, logradouro, bairro e idCidade são obrigatórios' });
    try {
        await execSP('sp_InserirEndereco', r =>
            r.input('cep', sql.VarChar(8), cep)
             .input('logradouro', sql.VarChar(100), logradouro)
             .input('bairro', sql.VarChar(50), bairro)
             .input('complemento', sql.VarChar(50), complemento ?? null)
             .input('idcidade', sql.Int, idcidade)
        );
        res.status(201).json({ mensagem: 'Endereço cadastrado com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.post('/areas-conhecimento', async (req, res) => {
    const { nome } = req.body;
    if (!nome) return res.status(400).json({ erro: 'nome é obrigatório' });
    try {
        await execSP('sp_InserirAreaConhecimento', r =>
            r.input('nome', sql.VarChar(50), nome)
        );
        res.status(201).json({ mensagem: `Área de conhecimento '${nome}' inserida com sucesso!` });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.post('/exemplar-emprestado', async (req, res) => {
    const { idAluno, idExemplar, dataEmprestimo, dataDevolucao } = req.body;
    if (!idAluno || !idExemplar || !dataEmprestimo)
        return res.status(400).json({ erro: 'idAluno, idExemplar e dataEmprestimo são obrigatórios' });
    try {
        await execSP('sp_InserirExemplarEmprestado', r =>
            r.input('idAluno', sql.Int, idAluno)
             .input('idExemplar', sql.Int, idExemplar)
             .input('dataEmprestimo', sql.Date, dataEmprestimo)
             .input('dataDevolucaoPrevista', sql.Date, dataDevolucao ?? null)
        );
        res.status(201).json({ mensagem: 'Empréstimo registrado com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.post('/historico', async (req, res) => {
    const { data_emprestimo, data_devolucao, data_pagamento_multa, descricao, idExemplarEmprestado } = req.body;
    if (!data_emprestimo || !idExemplarEmprestado)
        return res.status(400).json({ erro: 'data_emprestimo e idExemplarEmprestado são obrigatórios' });
    try {
        await execSP('sp_InserirHistorico', r =>
            r.input('data_emprestimo', sql.Date, data_emprestimo)
             .input('data_devolucao', sql.Date, data_devolucao ?? null)
             .input('data_pagamento_multa', sql.Date, data_pagamento_multa ?? null)
             .input('descricao', sql.VarChar(255), descricao ?? null)
             .input('idExemplarEmprestado', sql.Int, idExemplarEmprestado)
        );
        res.status(201).json({ mensagem: 'Registro de histórico inserido com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// ─── PUTs ─────────────────────────────────────────────────────────────────────

app.put('/alunos/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, cpf, telefone, email, turma, data_nascimento, idEndereco } = req.body;
    if (!nome || !cpf || !telefone || !data_nascimento || !idEndereco)
        return res.status(400).json({ erro: 'nome, cpf, telefone, data_nascimento e idEndereco são obrigatórios' });
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('id', sql.Int, parseInt(id))
            .input('nome', sql.VarChar(100), nome)
            .input('cpf', sql.VarChar(14), cpf)
            .input('telefone', sql.VarChar(20), telefone)
            .input('email', sql.VarChar(100), email ?? null)
            .input('turma', sql.VarChar(15), turma ?? null)
            .input('data_nascimento', sql.Date, data_nascimento)
            .input('idEndereco', sql.Int, idEndereco)
            .query(`
                UPDATE Aluno
                SET nome = @nome, cpf = @cpf, telefone = @telefone,
                    email = @email, turma = @turma,
                    data_nascimento = @data_nascimento, idEndereco = @idEndereco
                WHERE id = @id
            `);
        if (result.rowsAffected[0] === 0)
            return res.status(404).json({ erro: 'Aluno não encontrado' });
        res.json({ mensagem: 'Aluno atualizado com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.put('/livros/:id', async (req, res) => {
    const { id } = req.params;
    const { titulo, idioma, anoPublicacao, isbn, idEditora } = req.body;
    if (!titulo) return res.status(400).json({ erro: 'titulo é obrigatório' });
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('id', sql.Int, parseInt(id))
            .input('titulo', sql.VarChar(255), titulo)
            .input('idioma', sql.VarChar(100), idioma ?? null)
            .input('anoPublicacao', sql.Date, anoPublicacao ?? null)
            .input('isbn', sql.VarChar(13), isbn ?? null)
            .input('idEditora', sql.Int, idEditora ?? null)
            .query(`
                UPDATE Livro
                SET titulo = @titulo, idioma = @idioma,
                    anoPublicacao = @anoPublicacao, isbn = @isbn, idEditora = @idEditora
                WHERE id = @id
            `);
        if (result.rowsAffected[0] === 0)
            return res.status(404).json({ erro: 'Livro não encontrado' });
        res.json({ mensagem: 'Livro atualizado com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.put('/autores/:id', async (req, res) => {
    const { id } = req.params;
    const nome = req.body.nome || req.body.nome_autor;
    if (!nome) return res.status(400).json({ erro: 'nome é obrigatório' });
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('id', sql.Int, parseInt(id))
            .input('nome', sql.VarChar(255), nome)
            .query('UPDATE Autor SET nome = @nome WHERE id = @id');
        if (result.rowsAffected[0] === 0)
            return res.status(404).json({ erro: 'Autor não encontrado' });
        res.json({ mensagem: 'Autor atualizado com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.put('/editoras/:id', async (req, res) => {
    const { id } = req.params;
    const { nome } = req.body;
    if (!nome) return res.status(400).json({ erro: 'nome é obrigatório' });
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('id', sql.Int, parseInt(id))
            .input('nome', sql.VarChar(100), nome)
            .query('UPDATE Editora SET nome = @nome WHERE id = @id');
        if (result.rowsAffected[0] === 0)
            return res.status(404).json({ erro: 'Editora não encontrada' });
        res.json({ mensagem: 'Editora atualizada com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.put('/estados/:id', async (req, res) => {
    const { id } = req.params;
    const { nome } = req.body;
    if (!nome) return res.status(400).json({ erro: 'nome é obrigatório' });
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('id', sql.Int, parseInt(id))
            .input('nome', sql.VarChar(100), nome)
            .query('UPDATE Estado SET nome = @nome WHERE id = @id');
        if (result.rowsAffected[0] === 0)
            return res.status(404).json({ erro: 'Estado não encontrado' });
        res.json({ mensagem: 'Estado atualizado com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.put('/cidades/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, idEstado } = req.body;
    if (!nome || !idEstado) return res.status(400).json({ erro: 'nome e idEstado são obrigatórios' });
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('id', sql.Int, parseInt(id))
            .input('nome', sql.VarChar(200), nome)
            .input('idEstado', sql.Int, idEstado)
            .query('UPDATE Cidade SET nome = @nome, idEstado = @idEstado WHERE id = @id');
        if (result.rowsAffected[0] === 0)
            return res.status(404).json({ erro: 'Cidade não encontrada' });
        res.json({ mensagem: 'Cidade atualizada com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.put('/enderecos/:id', async (req, res) => {
    const { id } = req.params;
    const { cep, logradouro, bairro, complemento } = req.body;
    const idcidade = req.body.idCidade || req.body.idcidade;
    if (!cep || !logradouro || !bairro || !idcidade)
        return res.status(400).json({ erro: 'cep, logradouro, bairro e idCidade são obrigatórios' });
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('id', sql.Int, parseInt(id))
            .input('cep', sql.VarChar(8), cep)
            .input('logradouro', sql.VarChar(100), logradouro)
            .input('bairro', sql.VarChar(50), bairro)
            .input('complemento', sql.VarChar(50), complemento ?? null)
            .input('idCidade', sql.Int, idcidade)
            .query(`
                UPDATE Endereco
                SET cep = @cep, logradouro = @logradouro, bairro = @bairro,
                    complemento = @complemento, idCidade = @idCidade
                WHERE id = @id
            `);
        if (result.rowsAffected[0] === 0)
            return res.status(404).json({ erro: 'Endereço não encontrado' });
        res.json({ mensagem: 'Endereço atualizado com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.put('/areas-conhecimento/:id', async (req, res) => {
    const { id } = req.params;
    const { nome } = req.body;
    if (!nome) return res.status(400).json({ erro: 'nome é obrigatório' });
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('id', sql.Int, parseInt(id))
            .input('nome', sql.VarChar(50), nome)
            .query('UPDATE Area_Conhecimento SET nome = @nome WHERE id = @id');
        if (result.rowsAffected[0] === 0)
            return res.status(404).json({ erro: 'Área de conhecimento não encontrada' });
        res.json({ mensagem: 'Área de conhecimento atualizada com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.put('/exemplares/:id', async (req, res) => {
    const { id } = req.params;
    const { numero_exemplar, idLivro, status } = req.body;
    if (!numero_exemplar || !idLivro)
        return res.status(400).json({ erro: 'numero_exemplar e idLivro são obrigatórios' });
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('id', sql.Int, parseInt(id))
            .input('numero_exemplar', sql.Int, numero_exemplar)
            .input('idLivro', sql.Int, idLivro)
            .input('status', sql.VarChar(20), status ?? null)
            .query(`
                UPDATE Exemplar
                SET numero_exemplar = @numero_exemplar, idLivro = @idLivro, status = @status
                WHERE id = @id
            `);
        if (result.rowsAffected[0] === 0)
            return res.status(404).json({ erro: 'Exemplar não encontrado' });
        res.json({ mensagem: 'Exemplar atualizado com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.put('/exemplar-emprestado/:id', async (req, res) => {
    const { id } = req.params;
    const { idAluno, idExemplar, dataEmprestimo, dataDevolucaoPrevista, dataDevolucao } = req.body;
    if (!idAluno || !idExemplar || !dataEmprestimo)
        return res.status(400).json({ erro: 'idAluno, idExemplar e dataEmprestimo são obrigatórios' });
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('id', sql.Int, parseInt(id))
            .input('idAluno', sql.Int, idAluno)
            .input('idExemplar', sql.Int, idExemplar)
            .input('dataEmprestimo', sql.Date, dataEmprestimo)
            .input('dataDevolucaoPrevista', sql.Date, dataDevolucaoPrevista ?? null)
            .input('dataDevolucao', sql.Date, dataDevolucao ?? null)
            .query(`
                UPDATE Exemplar_Emprestado
                SET idAluno = @idAluno, idExemplar = @idExemplar,
                    dataEmprestimo = @dataEmprestimo,
                    dataDevolucaoPrevista = @dataDevolucaoPrevista,
                    dataDevolucao = @dataDevolucao
                WHERE id = @id
            `);
        if (result.rowsAffected[0] === 0)
            return res.status(404).json({ erro: 'Empréstimo não encontrado' });
        res.json({ mensagem: 'Empréstimo atualizado com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// Atalho específico para registrar devolução (mantido por compatibilidade)
app.put('/exemplar-emprestado/:id/devolver', async (req, res) => {
    const { id } = req.params;
    const { dataDevolucao } = req.body;
    if (!dataDevolucao)
        return res.status(400).json({ erro: 'dataDevolucao é obrigatória' });
    try {
        const pool = await getPool();
        await pool.request()
            .input('id', sql.Int, parseInt(id))
            .input('dataDevolucao', sql.Date, dataDevolucao)
            .query('UPDATE Exemplar_Emprestado SET dataDevolucao = @dataDevolucao WHERE id = @id');
        res.json({ mensagem: 'Devolução registrada com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.put('/historico/:id', async (req, res) => {
    const { id } = req.params;
    const { data_emprestimo, data_devolucao, data_pagamento_multa, descricao, idExemplarEmprestado } = req.body;
    if (!data_emprestimo || !idExemplarEmprestado)
        return res.status(400).json({ erro: 'data_emprestimo e idExemplarEmprestado são obrigatórios' });
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('id', sql.Int, parseInt(id))
            .input('data_emprestimo', sql.Date, data_emprestimo)
            .input('data_devolucao', sql.Date, data_devolucao ?? null)
            .input('data_pagamento_multa', sql.Date, data_pagamento_multa ?? null)
            .input('descricao', sql.VarChar(255), descricao ?? null)
            .input('idExemplarEmprestado', sql.Int, idExemplarEmprestado)
            .query(`
                UPDATE Historico
                SET data_emprestimo = @data_emprestimo, data_devolucao = @data_devolucao,
                    data_pagamento_multa = @data_pagamento_multa, descricao = @descricao,
                    idExemplarEmprestado = @idExemplarEmprestado
                WHERE id = @id
            `);
        if (result.rowsAffected[0] === 0)
            return res.status(404).json({ erro: 'Histórico não encontrado' });
        res.json({ mensagem: 'Histórico atualizado com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// ─── DELETEs ──────────────────────────────────────────────────────────────────

app.delete('/alunos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('id', sql.Int, parseInt(id))
            .query('DELETE FROM Aluno WHERE id = @id');
        if (result.rowsAffected[0] === 0)
            return res.status(404).json({ erro: 'Aluno não encontrado' });
        res.json({ mensagem: 'Aluno excluído com sucesso!' });
    } catch (err) {
        // FK violation
        if (err.number === 547)
            return res.status(409).json({ erro: 'Não é possível excluir: aluno possui registros vinculados.' });
        res.status(500).json({ erro: err.message });
    }
});

app.delete('/livros/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('id', sql.Int, parseInt(id))
            .query('DELETE FROM Livro WHERE id = @id');
        if (result.rowsAffected[0] === 0)
            return res.status(404).json({ erro: 'Livro não encontrado' });
        res.json({ mensagem: 'Livro excluído com sucesso!' });
    } catch (err) {
        if (err.number === 547)
            return res.status(409).json({ erro: 'Não é possível excluir: livro possui exemplares ou vínculos.' });
        res.status(500).json({ erro: err.message });
    }
});

app.delete('/autores/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('id', sql.Int, parseInt(id))
            .query('DELETE FROM Autor WHERE id = @id');
        if (result.rowsAffected[0] === 0)
            return res.status(404).json({ erro: 'Autor não encontrado' });
        res.json({ mensagem: 'Autor excluído com sucesso!' });
    } catch (err) {
        if (err.number === 547)
            return res.status(409).json({ erro: 'Não é possível excluir: autor está vinculado a livros.' });
        res.status(500).json({ erro: err.message });
    }
});

app.delete('/autor-livro', async (req, res) => {
    const { idAutor, idLivro } = req.body;
    if (!idAutor || !idLivro) return res.status(400).json({ erro: 'idAutor e idLivro são obrigatórios' });
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('idAutor', sql.Int, idAutor)
            .input('idLivro', sql.Int, idLivro)
            .query('DELETE FROM Autor_Livro WHERE idAutor = @idAutor AND idLivro = @idLivro');
        if (result.rowsAffected[0] === 0)
            return res.status(404).json({ erro: 'Vínculo não encontrado' });
        res.json({ mensagem: 'Vínculo autor-livro removido com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.delete('/area-livro', async (req, res) => {
    const { idArea, idLivro } = req.body;
    if (!idArea || !idLivro) return res.status(400).json({ erro: 'idArea e idLivro são obrigatórios' });
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('idArea', sql.Int, idArea)
            .input('idLivro', sql.Int, idLivro)
            .query('DELETE FROM Area_Livro WHERE idArea = @idArea AND idLivro = @idLivro');
        if (result.rowsAffected[0] === 0)
            return res.status(404).json({ erro: 'Vínculo não encontrado' });
        res.json({ mensagem: 'Vínculo área-livro removido com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.delete('/editoras/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('id', sql.Int, parseInt(id))
            .query('DELETE FROM Editora WHERE id = @id');
        if (result.rowsAffected[0] === 0)
            return res.status(404).json({ erro: 'Editora não encontrada' });
        res.json({ mensagem: 'Editora excluída com sucesso!' });
    } catch (err) {
        if (err.number === 547)
            return res.status(409).json({ erro: 'Não é possível excluir: editora possui livros vinculados.' });
        res.status(500).json({ erro: err.message });
    }
});

app.delete('/estados/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('id', sql.Int, parseInt(id))
            .query('DELETE FROM Estado WHERE id = @id');
        if (result.rowsAffected[0] === 0)
            return res.status(404).json({ erro: 'Estado não encontrado' });
        res.json({ mensagem: 'Estado excluído com sucesso!' });
    } catch (err) {
        if (err.number === 547)
            return res.status(409).json({ erro: 'Não é possível excluir: estado possui cidades vinculadas.' });
        res.status(500).json({ erro: err.message });
    }
});

app.delete('/cidades/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('id', sql.Int, parseInt(id))
            .query('DELETE FROM Cidade WHERE id = @id');
        if (result.rowsAffected[0] === 0)
            return res.status(404).json({ erro: 'Cidade não encontrada' });
        res.json({ mensagem: 'Cidade excluída com sucesso!' });
    } catch (err) {
        if (err.number === 547)
            return res.status(409).json({ erro: 'Não é possível excluir: cidade possui endereços vinculados.' });
        res.status(500).json({ erro: err.message });
    }
});

app.delete('/enderecos/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('id', sql.Int, parseInt(id))
            .query('DELETE FROM Endereco WHERE id = @id');
        if (result.rowsAffected[0] === 0)
            return res.status(404).json({ erro: 'Endereço não encontrado' });
        res.json({ mensagem: 'Endereço excluído com sucesso!' });
    } catch (err) {
        if (err.number === 547)
            return res.status(409).json({ erro: 'Não é possível excluir: endereço está vinculado a alunos.' });
        res.status(500).json({ erro: err.message });
    }
});

app.delete('/areas-conhecimento/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('id', sql.Int, parseInt(id))
            .query('DELETE FROM Area_Conhecimento WHERE id = @id');
        if (result.rowsAffected[0] === 0)
            return res.status(404).json({ erro: 'Área de conhecimento não encontrada' });
        res.json({ mensagem: 'Área de conhecimento excluída com sucesso!' });
    } catch (err) {
        if (err.number === 547)
            return res.status(409).json({ erro: 'Não é possível excluir: área está vinculada a livros.' });
        res.status(500).json({ erro: err.message });
    }
});

app.delete('/exemplares/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('id', sql.Int, parseInt(id))
            .query('DELETE FROM Exemplar WHERE id = @id');
        if (result.rowsAffected[0] === 0)
            return res.status(404).json({ erro: 'Exemplar não encontrado' });
        res.json({ mensagem: 'Exemplar excluído com sucesso!' });
    } catch (err) {
        if (err.number === 547)
            return res.status(409).json({ erro: 'Não é possível excluir: exemplar possui empréstimos vinculados.' });
        res.status(500).json({ erro: err.message });
    }
});

app.delete('/exemplar-emprestado/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('id', sql.Int, parseInt(id))
            .query('DELETE FROM Exemplar_Emprestado WHERE id = @id');
        if (result.rowsAffected[0] === 0)
            return res.status(404).json({ erro: 'Empréstimo não encontrado' });
        res.json({ mensagem: 'Empréstimo excluído com sucesso!' });
    } catch (err) {
        if (err.number === 547)
            return res.status(409).json({ erro: 'Não é possível excluir: empréstimo possui histórico vinculado.' });
        res.status(500).json({ erro: err.message });
    }
});

app.delete('/historico/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const pool = await getPool();
        const result = await pool.request()
            .input('id', sql.Int, parseInt(id))
            .query('DELETE FROM Historico WHERE id = @id');
        if (result.rowsAffected[0] === 0)
            return res.status(404).json({ erro: 'Histórico não encontrado' });
        res.json({ mensagem: 'Histórico excluído com sucesso!' });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

// ─── BUSCA GERAL ──────────────────────────────────────────────────────────────

app.get('/busca', async (req, res) => {
    const termo = req.query.q;
    if (!termo) return res.status(400).json({ erro: 'Informe um termo de busca' });
    try {
        const pool = await getPool();
        const filtro = `%${termo}%`;

        const [alunos, livros, editoras] = await Promise.all([
            pool.request().input('f', sql.VarChar, filtro)
                .query('SELECT id, nome, cpf FROM Aluno WHERE nome LIKE @f OR cpf LIKE @f'),
            pool.request().input('f', sql.VarChar, filtro)
                .query('SELECT id, titulo, isbn FROM Livro WHERE titulo LIKE @f OR isbn LIKE @f'),
            pool.request().input('f', sql.VarChar, filtro)
                .query('SELECT id, nome FROM Editora WHERE nome LIKE @f'),
        ]);

        res.json({
            alunos: alunos.recordset,
            livros: livros.recordset,
            editoras: editoras.recordset,
        });
    } catch (err) {
        res.status(500).json({ erro: err.message });
    }
});

app.listen(4000, () => console.log('✅ Servidor rodando na porta 4000'));