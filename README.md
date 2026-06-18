# 📚 Biblioteca Escola Saber

Sistema web fullstack para gerenciamento de biblioteca escolar — cadastro de alunos, livros, autores, editoras, empréstimos e histórico de multas.

---

## 🛠️ Tecnologias

| Camada | Tecnologia |
|--------|------------|
| Banco de dados | Microsoft SQL Server 2022 (Docker) |
| Backend | Node.js + Express |
| Frontend | Angular 17+ com Tailwind CSS |
| ORM / Driver | `mssql` (tedious) |
| Gerenciador de BD | DBeaver |

---

## 📁 Estrutura do Projeto

```
trabalhoWeb/
└── biblioteca/
    ├── backend/
    │   ├── server.js             # API REST (Express)
    │   ├── .env                  # Variáveis de ambiente (não versionar)
    │   ├── package.json
    │   └── node_modules/
    └── src/
        └── app/
            ├── aluno/            # Cadastro de alunos (wizard 4 etapas)
            ├── area-conhecimento/
            ├── dashboard/
            ├── editora/
            ├── exemplar/         # Empréstimos e devoluções
            ├── historico/        # Histórico com multas
            └── livro/
```

---

## 🗄️ Banco de Dados

**Nome:** `Biblioteca_Escola_Saber`  
**Esquema:** `dbo`  
**Porta:** `1433`

### Diagrama de relacionamento

```
Estado → Cidade → Endereco → Aluno
Editora → Livro ← Autor         (via Autor_Livro)
               ← Area_Conhecimento (via Area_Livro)
Livro → Exemplar → Exemplar_Emprestado → Historico
```

### Tabelas

| Tabela | Descrição |
|--------|-----------|
| `Estado` | Estados do Brasil |
| `Cidade` | Cidades vinculadas a estados |
| `Endereco` | Endereços vinculados a cidades |
| `Aluno` | Cadastro de alunos |
| `Autor` | Cadastro de autores |
| `Editora` | Editoras dos livros |
| `Livro` | Catálogo de livros |
| `Exemplar` | Cópias físicas dos livros |
| `Autor_Livro` | Relacionamento N:N Autor ↔ Livro |
| `Area_Conhecimento` | Categorias de conhecimento |
| `Area_Livro` | Relacionamento N:N Área ↔ Livro |
| `Exemplar_Emprestado` | Empréstimos ativos |
| `Historico` | Histórico de devoluções e multas |

---

## ⚙️ Configuração

### 1. Pré-requisitos

- Node.js v18+
- Docker (para o SQL Server)
- Angular CLI (`npm install -g @angular/cli`)

### 2. Subir o SQL Server via Docker

```bash
docker run -e "ACCEPT_EULA=Y" -e "SA_PASSWORD=SuaSenha@1" \
  -p 1433:1433 --name sqlserver \
  --restart always \
  -d mcr.microsoft.com/mssql/server:2022-latest
```

### 3. Variáveis de ambiente

Crie o arquivo `backend/.env`:

```env
DB_USER=sa
DB_PASSWORD=SuaSenha@1
DB_SERVER=localhost
DB_PORT=1433
DB_NAME=Biblioteca_Escola_Saber
```

### 4. Instalar dependências e rodar o backend

```bash
cd backend
npm install
node server.js
# ✅ Servidor rodando na porta 4000
```

### 5. Rodar o frontend

```bash
cd biblioteca
npm install
ng serve
# ✅ Disponível em http://localhost:4200
```

---

## 🌐 API — Endpoints

### Listagem (GET)

| Rota | Descrição | Filtro |
|------|-----------|--------|
| `GET /alunos` | Lista alunos | `?busca=` |
| `GET /livros` | Lista livros | `?busca=` |
| `GET /autores` | Lista autores | `?busca=` |
| `GET /editoras` | Lista editoras | `?busca=` |
| `GET /estados` | Lista estados | — |
| `GET /cidades` | Lista cidades | — |
| `GET /enderecos` | Lista endereços | — |
| `GET /areas-conhecimento` | Lista áreas | `?busca=` |
| `GET /exemplar-emprestado` | Lista empréstimos | — |
| `GET /historico` | Histórico com joins | `?busca=` |

### Criação (POST)

| Rota | Body |
|------|------|
| `POST /alunos` | `{ nome, cpf, telefone, email, turma, dataNascimento, idEndereco }` |
| `POST /livros` | `{ titulo, idioma, isbn, anoPublicacao, idEditora }` |
| `POST /autores` | `{ nome }` |
| `POST /editoras` | `{ nome }` |
| `POST /estados` | `{ nome }` |
| `POST /cidades` | `{ nome, idEstado }` |
| `POST /enderecos` | `{ cep, logradouro, bairro, complemento, idCidade }` |
| `POST /areas-conhecimento` | `{ nome }` |
| `POST /autor-livro` | `{ idAutor, idLivro }` |
| `POST /area-livro` | `{ idArea, idLivro }` |
| `POST /exemplar-emprestado` | `{ idAluno, idExemplar, dataEmprestimo, dataDevolucao }` |

### Atualização (PUT)

| Rota | Descrição |
|------|-----------|
| `PUT /exemplar-emprestado/:id/devolver` | Registra devolução |

---

## 📋 Fluxos de Cadastro

### Aluno (wizard 4 etapas)
```
1. Estado → 2. Cidade → 3. Endereço → 4. Dados do Aluno
```

### Livro
```
1. Editora → 2. Livro → 3. Autor (+ vínculo) → 4. Área (+ vínculo)
```

---

## 🔧 Stored Procedures

Todas as operações de escrita usam Stored Procedures no SQL Server:

**Aluno:** `sp_InserirAluno` · `sp_AlterarAluno` · `sp_ExcluirAluno`  
**Livro:** `sp_InserirLivro`  
**Autor:** `sp_InserirAutor` · `sp_AlterarAutor` · `sp_ExcluirAutor`  
**Editora:** `sp_InserirEditora` · `sp_AlterarEditora` · `sp_ExcluirEditora`  
**Cidade:** `sp_InserirCidade` · `sp_AlterarCidade` · `sp_ExcluirCidade`  
**Estado:** `sp_InserirEstado` · `sp_AlterarEstado` · `sp_ExcluirEstado`  
**Endereço:** `sp_InserirEndereco` · `sp_AlterarEndereco` · `sp_ExcluirEndereco`  
**Área:** `sp_InserirAreaConhecimento` · `sp_AlterarAreaConhecimento` · `sp_ExcluirAreaConhecimento`  
**Vínculos:** `sp_InserirAutorLivro` · `sp_InserirAreaLivro`

---

## 👤 Autor

Desenvolvido por **Caio Silva**  
Estudante de Análise e Desenvolvimento de Sistemas (ADS) — UVV, Vila Velha/ES