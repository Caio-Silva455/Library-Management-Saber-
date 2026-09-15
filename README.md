# Biblioteca Escola Saber

Sistema web fullstack para gerenciamento de biblioteca escolar — cadastro de alunos, livros, autores, editoras, controle de empréstimos/devoluções e histórico de multas.

---

## Respostas às Perguntas do Trabalho

**1. Qual é o objetivo da aplicação?**
Gerenciar uma biblioteca escolar de ponta a ponta: cadastro de alunos, livros, autores e
editoras, controle de exemplares físicos, registro de empréstimos/devoluções e histórico
de multas.

**2. Quais tecnologias foram utilizadas?**
- **Frontend:** Angular 17+ com Tailwind CSS
- **Backend:** Node.js + Express
- **Banco de dados:** Microsoft SQL Server 2022
- **Driver de banco:** `mssql`
- **Conteinerização:** Docker + Docker Compose
- **Servidor web (produção):** Nginx (serve o build do Angular)

**3. Como executar o projeto?**
```bash
cp .env.example .env
# ajuste a senha do banco em .env, se quiser
docker compose up --build
```

**4. Qual porta deve ser acessada?**
- Frontend (aplicação): **http://localhost:8080**
- API do backend: **http://localhost:4000**

**5. Quais containers são utilizados?**
Três containers: `biblioteca-frontend` (Nginx + Angular), `biblioteca-backend`
(Node/Express) e `biblioteca-db` (SQL Server).

**6. Qual banco de dados é utilizado?**
Microsoft SQL Server 2022, banco `Biblioteca_Escola_Saber`, rodando na porta `1433`.

**7. Qual volume foi criado?**
O volume nomeado `db-data`, que persiste os arquivos do SQL Server em
`/var/opt/mssql` dentro do container — os dados não se perdem ao reiniciar ou
recriar os containers.

**8. Qual rede foi criada?**
A rede `biblioteca-net` (bridge), que conecta os três serviços entre si para que
o frontend fale com o backend e o backend fale com o banco pelo nome do serviço
(`backend`, `db`), sem precisar de IPs fixos.

**9. Quais variáveis de ambiente são utilizadas?**

| Variável | Uso |
|---|---|
| `DB_SA_PASSWORD` | Senha do usuário `sa` do SQL Server |
| `DB_USER` | Usuário de conexão com o banco (`sa`) |
| `DB_SERVER` / `DB_PORT` | Host e porta do banco (`db`, `1433` dentro da rede Docker) |
| `DB_NAME` | Nome do banco de dados |
| `PORT` | Porta em que o backend Express escuta (`4000`) |
| `JWT_SECRET` | Segredo usado para assinar tokens de autenticação |

**10. Como parar o projeto?**
```bash
docker compose down        # para e remove os containers
docker compose down -v     # além disso, remove o volume do banco (apaga os dados)
```

---

## 🛠️ Tecnologias

| Camada | Tecnologia |
|--------|------------|
| Banco de dados | Microsoft SQL Server 2022 (Docker) |
| Backend | Node.js + Express |
| Frontend | Angular 17+ com Tailwind CSS |
| ORM / Driver | `mssql` (tedious) |
| Conteinerização | Docker + Docker Compose |
| Servidor web (produção) | Nginx |
| Gerenciador de BD (dev) | DBeaver |

---

## 📁 Estrutura do Projeto

```
trabalhoWeb/
└── biblioteca/
    ├── Dockerfile                 # Build do frontend Angular (multi-stage + Nginx)
    ├── nginx.conf
    ├── docker-compose.yml
    ├── .env.example
    ├── backend/
    │   ├── Dockerfile             # Build do backend Node/Express
    │   ├── server.js              # API REST (Express)
    │   ├── .env                   # Variáveis de ambiente (não versionar)
    │   └── package.json
    └── src/
        └── app/
            ├── aluno/             # Cadastro de alunos (wizard 4 etapas)
            ├── area-conhecimento/
            ├── dashboard/
            ├── editora/
            ├── exemplar/          # Empréstimos e devoluções
            ├── historico/         # Histórico com multas
            └── livro/
```

---

## 🐳 Como rodar com Docker (recomendado)

### Pré-requisitos
- Docker e Docker Compose instalados

### Passos

1. Copie o arquivo de variáveis de ambiente:
   ```bash
   cp .env.example .env
   ```
2. Ajuste os valores em `.env` se necessário (senha do banco, etc.).
3. Suba os containers:
   ```bash
   docker compose up --build
   ```
4. Acesse:
   - **Frontend (Angular):** http://localhost:8080
   - **Backend (API):** http://localhost:4000
   - **Banco de dados (SQL Server):** localhost:1433

### Arquitetura

| Serviço  | Imagem base              | Porta host | Função                     |
|----------|---------------------------|------------|-----------------------------|
| frontend | nginx:alpine               | 8080       | Serve o Angular buildado    |
| backend  | node:20-alpine             | 4000       | API Express                 |
| db       | mssql/server:2022-latest   | 1433       | Banco de dados SQL Server   |

Os três serviços se comunicam pela rede `biblioteca-net`, e os dados do banco
são persistidos no volume nomeado `db-data` — nada se perde ao reiniciar os
containers.

### Parar o projeto
```bash
docker compose down        # para e remove os containers
docker compose down -v     # além disso, remove o volume do banco (apaga os dados)
```

---

## 💻 Rodando sem Docker (desenvolvimento local)

Alternativa útil para debugar frontend/backend isoladamente, sem subir tudo em container.

### Pré-requisitos
- Node.js v18+
- Angular CLI (`npm install -g @angular/cli`)
- Um SQL Server acessível (local, ou o próprio container `db` do Compose rodando sozinho: `docker compose up db`)

### 1. Variáveis de ambiente

Crie `backend/.env`:
```env
DB_USER=sa
DB_PASSWORD=SuaSenha@1
DB_SERVER=localhost
DB_PORT=1433
DB_NAME=Biblioteca_Escola_Saber
```

### 2. Backend
```bash
cd backend
npm install
node server.js
# ✅ Servidor rodando na porta 4000
```

### 3. Frontend
```bash
cd biblioteca
npm install
ng serve
# ✅ Disponível em http://localhost:4200
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