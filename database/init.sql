IF DB_ID('Biblioteca_Escola_Saber') IS NULL
    CREATE DATABASE Biblioteca_Escola_Saber;
GO

USE Biblioteca_Escola_Saber;
GO

CREATE TABLE Estado(
    id int primary key identity(1,1),
    nome varchar(100) not null unique
);

CREATE TABLE Cidade(
	id int primary key identity(1,1),
	idEstado int not null,
	nome varchar(200),
	-- a ideia da nomeação das fks é: 
	-- fk_<TabelaOrigem>_<ColunaOrigem>_<TabelaDestino>_<ColunaDestino>
	constraint fk_Estado_id_Cidade_idEstado foreign key(idEstado) references Estado(id)

);

CREATE TABLE Endereco(
	id int identity(1,1) primary key,
	cep varchar(8),
	logradouro varchar(100),
	bairro varchar(50),
	complemento varchar(50),
	idCidade int not null,
	constraint fk_Cidade_id_Endereco_idCidade foreign key(idCidade) references Cidade(id)

);

CREATE TABLE Aluno(
	id int identity(1,1) primary key,
	nome varchar(100) not null,
	cpf varchar(14) not null unique,
	telefone varchar(20) not null,
	email varchar(100),
	turma varchar(15),
	data_nascimento date not null,
	idEndereco int not null,
	constraint fk_Endereco_id_Aluno_idEndereco foreign key(idEndereco) references Endereco(id)
);

CREATE TABLE Editora(
	id int identity(1,1) primary key,
	nome varchar(100)
);

CREATE TABLE Area_Conhecimento(
	id int identity(1,1) primary key,
	nome varchar(50) -- Aumentei um pouco a quantidade do modelo lógico pra garantir

);


CREATE TABLE Autor(
	id int identity(1,1) primary key,
	nome varchar(255)

);

CREATE TABLE Livro(
	id int identity(1,1) primary key,
	titulo varchar(255) not null,
	idioma varchar(100),
	ano_publicacao date,
	isbn varchar(13),
	idEditora int,
	constraint fk_Editora_id_Livro_idEditora foreign key(idEditora) references Editora(id)

);

CREATE TABLE Autor_Livro(
	idAutor int not null,
	idLivro int not null,

	constraint fk_Autor_id_AutorLivro_idAutor foreign key(idAutor) references Autor(id),
	constraint fk_Livro_id_AutorLivro_idLivro foreign key(idLivro) references Livro(id),

	constraint pk_AutorLivro primary key(idAutor,idLivro)

);


CREATE TABLE Area_Livro(
	idAreaConhecimento int not null,
	idLivro int not null,

	constraint fk_AreaConhecimento_id_AreaLivro_idAreaConhecimento foreign key(idAreaConhecimento) references Area_Conhecimento(id),
	constraint fk_Livro_id_AreaLivro_idLivro foreign key(idLivro) references Livro(id),

	constraint pk_AreaLivro primary key (idAreaConhecimento,idLivro)

);


CREATE TABLE Exemplar(
	id int identity(1,1) primary key,
	status int not null, -- 0 - Disponível, 1 - Emprestado, 2 - Manutenção, 3 - Perdido/Destruído

	idLivro int not null,
	constraint fk_Livro_id_Exemplar_idLivro foreign key(idLivro) references Livro(id)

);


CREATE TABLE Exemplar_Emprestado(
	id int identity(1,1) primary key,
	idAluno int not null,
	idExemplar int not null unique, -- unique porque só terá um exemplar por vez nessa tabela
	data_emprestimo date default cast(getdate() as date), -- Data de empréstimo será a atual por padrão
	data_devolucao_estimada date null, 

	-- Esse check serve para verificar se a data inserida vai ser válida (depois da data atual)

	constraint chk_dataDevolucao_estimada check (data_devolucao_estimada >= cast(getdate() as date)),

	constraint fk_Aluno_id_ExemplarEmprestado_idAluno foreign key(idAluno) references Aluno(id),
	constraint fk_Exemplar_id_ExemplarEmprestado_idExemplar foreign key(idExemplar) references Exemplar(id)

);

CREATE TABLE Historico(
	id int identity(1,1) primary key,
	data_emprestimo date not null,
	data_devolucao_estimada date,
	data_devolucao_final date not null, -- O cálculo da multa só acontece quando houver conclusão
	-- do empréstimo, se determinado perdido será a partir da comunicação do aluno ou prazo final
	-- de resposta
	data_pagamento_multa date null default null,
	idEmprestimo int not null,
	idExemplar int not null,
	idAluno int not null,
	status_livro_devolucao int not null,
	descricao text null, -- opcional, em casos de algum problema específico em que o livro não foi retornado
	--Não irei adicionar Fks nessa tabela, o objetivo dela é manter a informação mesmo que na original ela seja excluída.
);


--SP
-- Criar Store procedures para inserção, deleção e update nas tabelas.


-- TABELA AUTOR
CREATE PROCEDURE sp_InserirAutor
	@nome_autor varchar(255)

	as
	begin

		begin try
			insert into Autor(nome) values(@nome_autor)
			print 'o autor '+@nome_autor+' foi inserido com sucesso!'
		end try
		begin catch
			select  ERROR_NUMBER() AS Numero_erro,
			ERROR_MESSAGE() AS Mensagem_erro;
		end catch;
	end;

	go

CREATE PROCEDURE sp_AlterarAutor
	@idAutor int,
	@nome_autor varchar(255)

	as
	begin
		begin try
			if not exists(select id from Autor where id = @idautor)
				begin
					print 'Erro: O Id informado não existe'
				end
				else
				begin
					update Autor
					set nome = @nome_autor
					where id=@idAutor
					print 'Nome do autor alterado com sucesso'
				end
		end try
		begin catch
					select  ERROR_NUMBER() AS Numero_erro,
					ERROR_MESSAGE() AS Mensagem_erro;
		end catch
	end


go


CREATE PROCEDURE sp_ExcluirAutor
	@idAutor int
	as
	begin
		begin try
			if not exists(select id from Autor where id = @idAutor)
				begin
					print 'Erro: O Id informado não existe'
				end
				else
				begin
					delete from Autor
					where id= @idAutor
				end
		end try
		begin catch
					select  ERROR_NUMBER() AS Numero_erro,
					ERROR_MESSAGE() AS Mensagem_erro;
		end catch
	end


go

-- TABELA AREA CONHECIMENTO
CREATE PROCEDURE sp_InserirAreaConhecimento
	@nome varchar(50)
	as
	begin
		begin try
			insert into Area_Conhecimento(nome) values (@nome)
			print 'A área de conhecimento '+@nome+' foi inserida com sucesso!'
		end try
		begin catch
			select  ERROR_NUMBER() AS Numero_erro,
			ERROR_MESSAGE() AS Mensagem_erro;
		end catch;
	end

go

CREATE PROCEDURE sp_AlterarAreaConhecimento
	@idAreaConhecimento int,
	@nome varchar(50)
	as
	begin
		begin try
			if not exists(select id from Area_Conhecimento where id = @idAreaConhecimento)
				begin
					print 'Erro: O Id informado não existe'
				end
			else
				begin
					update Area_Conhecimento
					set nome = @nome
					where id=@idAreaConhecimento
					print 'Nome da Area de Conhecimento foi alterado com sucesso'
				end
		end try
		begin catch
			select  ERROR_NUMBER() AS Numero_erro,
			ERROR_MESSAGE() AS Mensagem_erro;
		end catch
	end;

go

CREATE PROCEDURE sp_ExcluirAreaConhecimento
	@idAreaConhecimento int
	as
	begin
		begin try
		if not exists (select id from Area_Conhecimento where id = @idAreaConhecimento)
			begin
				print 'Erro: O id da Área de conhecimento inserida não existe'
			end
			else
			begin
				delete from Area_Conhecimento
				where id=@idAreaConhecimento
			end
		end try
		begin catch
			select  ERROR_NUMBER() AS Numero_erro,
			ERROR_MESSAGE() AS Mensagem_erro;
		end catch
	end;
go

-- TABELA ESTADO

CREATE PROCEDURE sp_InserirEstado
	@nome varchar(100)
	as
	begin
		begin try
			insert into Estado(nome) values (@nome)
			print 'O Estado '+@nome+' foi inserida com sucesso!'	
		end try
		begin catch
			select  ERROR_NUMBER() AS Numero_erro,
			ERROR_MESSAGE() AS Mensagem_erro;
		end catch
	end;

go

CREATE PROCEDURE sp_AlterarEstado
	@idEstado int,
	@nome varchar(100)
	as
	begin
		begin try
		if not exists(select id from Estado where id= @idEstado)
			begin
				print 'Erro: O Id informado não existe na base de dados'
			end
		else 
			begin
				update Estado
				set nome = @nome
				where id = @idEstado
				print 'Nome do Estado foi alterado com sucesso'
			end
		end try
		begin catch
			select  ERROR_NUMBER() AS Numero_erro,
			ERROR_MESSAGE() AS Mensagem_erro;
		end catch
	end;

go

CREATE PROCEDURE sp_ExcluirEstado
	@idEstado int
	as
	begin
		begin try
		if not exists (select id from Estado where id = @idEstado)
			begin
				print 'Erro: O id do Estado inserido não existe'
			end
			else
			begin
				delete from Estado
				where id=@idEstado
			end
		end try
		begin catch
			select  ERROR_NUMBER() AS Numero_erro,
			ERROR_MESSAGE() AS Mensagem_erro;
		end catch
	end;

go

-- TABELA CIDADE

CREATE PROCEDURE sp_InserirCidade
	@nome varchar(200),
	@idEstado int
	as
	begin
		begin try
			if not exists (select id from Estado where id = @idEstado)
			begin
				print 'Erro: O id do estado não existe'
			end
			else
			begin
				insert into Cidade(nome,idEstado) values (@nome,@idEstado)
				print 'A Cidade '+@nome+' foi inserida com sucesso!'
			end
		end try
		begin catch
			select  ERROR_NUMBER() AS Numero_erro,
			ERROR_MESSAGE() AS Mensagem_erro;
		end catch
	end;

go

CREATE PROCEDURE sp_AlterarCidade
	@nome varchar(200),
	@idCidade int
	as
	begin
		begin try
			if not exists(select id from cidade where id = @idCidade)
			begin
				print 'Erro: O id da cidade informada não existe'
			end
			else
			begin
				update Cidade
				set nome = @nome
				where id = @idCidade
				print 'O nome da Cidade foi alterado com sucesso'
			end
		end try
		begin catch
			select  ERROR_NUMBER() AS Numero_erro,
			ERROR_MESSAGE() AS Mensagem_erro;
		end catch
	end;

go

CREATE PROCEDURE sp_ExcluirCidade
	@idCidade int
	as
	begin
		begin try
			if not exists (select id from cidade where id = @idCidade)
				begin
					print 'Erro: O id da cidade inserida não existe'
				end
				else
				begin
					delete from Cidade
					where id = @idCidade
				end
		end try
		begin catch
			select  ERROR_NUMBER() AS Numero_erro,
			ERROR_MESSAGE() AS Mensagem_erro;
		end catch
	end;

go

-- TABELA ENDEREÇO

CREATE PROCEDURE sp_InserirEndereco
	@cep varchar(8),
	@logradouro varchar(100),
	@bairro varchar(50),
	@complemento varchar(50),
	@idcidade int
	as
	begin
		begin try
			if not exists(select id from cidade where id=@idcidade)
			begin
				print 'Erro: O id da cidade informada não existe'
			end
			else
			begin
				insert into Endereco(cep,logradouro,bairro,complemento,idCidade)
				values(@cep,@logradouro,@bairro,@complemento,@idcidade)
				print 'Endereço cadastrado com sucesso'
			end
		end try
		begin catch
			select  ERROR_NUMBER() AS Numero_erro,
			ERROR_MESSAGE() AS Mensagem_erro;
		end catch
	end;

go

CREATE PROCEDURE sp_AlterarEndereco
	@idEndereco int,
	@cep varchar(8) = NULL,
	@logradouro varchar(100) = NULL,
	@bairro varchar(50) = NULL,
	@complemento varchar(50) = NULL,
	@idcidade int = NULL
	as
	begin
		begin try
			if not exists(select id from endereco where id=@idendereco)
			begin
				print 'Erro: O id do Endereço inserido não existe'
			end
			else
			begin
			update Endereco
			set idCidade= isnull(@idcidade,idCidade),
				cep = isnull(@cep,cep),
				logradouro = isnull(@logradouro,logradouro),
				bairro = isnull(@bairro,bairro),
				complemento = isnull(@complemento,complemento)
				where id = @idEndereco;
				print 'Endereço alterado com sucesso'
			end
		end try
		begin catch
			select  ERROR_NUMBER() AS Numero_erro,
			ERROR_MESSAGE() AS Mensagem_erro;
		end catch
	end;

go

CREATE PROCEDURE sp_ExcluirEndereco
	@idEndereco int

	as
	begin
		begin try
			if not exists (select id from endereco where id = @idEndereco)
			begin
				print 'Erro: O id do Endereço inserido não existe'
			end
			else
			begin
				delete from endereco
				where id = @idEndereco
			end
		end try
		begin catch
			select  ERROR_NUMBER() AS Numero_erro,
			ERROR_MESSAGE() AS Mensagem_erro;
		end catch
	end;

go

--TABELA EDITORA

CREATE PROCEDURE sp_InserirEditora
	@nome varchar(100)
	as
	begin
	begin try
			insert into Editora(nome) values(@nome)
			print 'A editora '+@nome+' foi inserida com sucesso!'
		end try
		begin catch
			select  ERROR_NUMBER() AS Numero_erro,
			ERROR_MESSAGE() AS Mensagem_erro;
		end catch;
	end;

	go

CREATE PROCEDURE sp_AlterarEditora
	@idEditora int,
	@nome varchar(100)
	as
	begin
	begin try
	if not exists(select id from Editora where id=@idEditora)
			begin
				print 'Erro: O id da Editora inserida não existe'
			end
			else
			begin
				update Editora
				set nome = @nome
				where id = @idEditora
				print 'O Nome da editora foi alterado com sucesso'
			end
		end try
		begin catch
			select  ERROR_NUMBER() AS Numero_erro,
			ERROR_MESSAGE() AS Mensagem_erro;
		end catch
	end;
	
	go

CREATE PROCEDURE sp_ExcluirEditora
	@idEditora int
	as
	begin
	begin try
		if not exists (select id from Editora where id = @idEditora)
			begin
				print 'Erro: O id da Editora inserida não existe'
			end
		else
			begin
				delete from Editora
				where id = @idEditora
			end
		end try
		begin catch
			select  ERROR_NUMBER() AS Numero_erro,
			ERROR_MESSAGE() AS Mensagem_erro;
		end catch
	end;

go

--SP2
-- Store procedures 2


--TABELA LIVRO

CREATE PROCEDURE sp_InserirLivro
	@titulo varchar(255),
	@idioma varchar(100) = NULL, -- Livros de imagem (infantis, fotografia...)
	@anoPublicacao date,
	@isbn varchar(13) = NULL,  --NULL para o caso de algum livro não tiver ISBN.
	@idEditora int = NULL --NULL para casos de autopublicação
	as
	begin
		begin try
				if @idEditora is not null and @idEditora not in(select id from Editora)
					begin
						print 'Erro: O id da Editora inserida não existe'	
					end
				else
					begin
					insert into Livro(titulo,idioma,ano_publicacao,isbn,idEditora)
					values(@titulo,@idioma,@anoPublicacao,@isbn,@idEditora)
					print 'O livro '+@titulo+' foi inserido com sucesso'
					end
		end try
		begin catch
			select  ERROR_NUMBER() AS Numero_erro,
			ERROR_MESSAGE() AS Mensagem_erro;
		end catch
	end

	go

CREATE PROCEDURE sp_AlterarLivro
	@idLivro int,
	@titulo varchar(255) = NULL,
	@idioma varchar(100) = NULL, 
	@anoPublicacao date = NULL,
	@isbn varchar(13) = NULL, 
	@idEditora int = NULL
	as
	begin
		begin try
			if not exists(select id from Livro where id = @idLivro)
				begin
					print 'Erro: Id do Livro não existe'
				end
			else 
			if @idEditora is not null and @idEditora not in(select id from Editora)
				begin
					print 'Erro: O id da Editora inserida não existe'	
				end
			else
				begin
					update Livro
					set titulo = isnull(@titulo,titulo),
						idioma = isnull(@idioma,idioma),
						ano_publicacao = isnull(@anoPublicacao,ano_publicacao),
						isbn = isnull(@isbn,isbn),
						idEditora = isnull(@idEditora,idEditora)
						where id = @idLivro
						print 'Alterações realizadas com sucesso'
				end	
		end try
		begin catch
			select  ERROR_NUMBER() AS Numero_erro,
			ERROR_MESSAGE() AS Mensagem_erro;
		end catch
	end

go

CREATE PROCEDURE sp_ExcluirLivro
	@idLivro int
	as
	begin
		begin try
			if not exists(select id from Livro where id = @idLivro)
			begin
				print 'Erro: Id do Livro não existe'
			end
			else
			begin
				delete from Livro
				where id = @idLivro
			end
		end try
		begin catch
			select  ERROR_NUMBER() AS Numero_erro,
			ERROR_MESSAGE() AS Mensagem_erro;
		end catch
	end
go
	

--TABELA AUTOR_LIVRO

CREATE PROCEDURE sp_InserirAutorLivro
	@idAutor int,
	@idLivro int
	as
	begin
	begin try
		if not exists (select id from Autor where id = @idAutor) or
		not exists(select id from Livro where id=@idLivro)
			begin
				print 'Erro: O id do Autor e/ou do Livro não existe(m)'
			end
		else
		begin
			insert into Autor_Livro(idAutor,idLivro) values(@idAutor,@idLivro)
			print 'O id do Autor e livro foram inseridos com sucesso'
		end
	end try
	begin catch
		select  ERROR_NUMBER() AS Numero_erro,
		ERROR_MESSAGE() AS Mensagem_erro;
	end catch
	end;

go

CREATE PROCEDURE sp_AlterarAutorLivro
	@idAutorAtual int,
	@idLivroAtual int,
	@idAutorNovo int = NULL,
	@idLivroNovo int = NULL
	as
	begin
	begin try
		if not exists (select id from Autor where id = @idAutorAtual) or
		not exists(select id from Livro where id=@idLivroAtual)
			begin
				print 'Erro: O id do Autor e/ou do Livro não existe(m)'
			end
		else
		if not exists(select idAutor,idLivro from Autor_Livro
		where idAutor = @idAutorAtual and idLivro = @idLivroAtual)
			begin
				print 'Erro: A combinação do id de Autor e livro atuais não existe'
			end
			else
				begin
				update Autor_Livro
				set
				idAutor= isnull(@idAutorNovo,idAutor),
				idLivro= isnull(@idLivroNovo,idLivro)
				where idAutor = @idAutorAtual and
				idLivro= @idLivroAtual
				print 'Alterações realizadas com sucesso'
			end
	end try
	begin catch
		select  ERROR_NUMBER() AS Numero_erro,
		ERROR_MESSAGE() AS Mensagem_erro;
	end catch
	end;
go


CREATE PROCEDURE sp_ExcluirAutorLivro
	@idAutor int,
	@idLivro int
	as
	begin
	begin try
		if not exists(select idAutor,idLivro from Autor_Livro
		where idAutor = @idAutor and idLivro = @idLivro)
			begin
				print 'Erro: A combinação do id de Autor e livro não existe'
			end
		else
		begin
			delete from Autor_Livro
			where idAutor = @idAutor and idLivro = @idLivro
		end
	end try
	begin catch
	end catch
	end;
go

-- TABELA AREA_LIVRO

CREATE PROCEDURE sp_InserirAreaLivro
	@idArea int,
	@idLivro int
	as
	begin
		begin try
			if not exists (select id from Area_Conhecimento where id = @idArea) or
			not exists(select id from Livro where id=@idLivro)
				begin
					print 'Erro: O id da Área e/ou do Livro não existe(m)'
				end
			else
				begin
					insert into Area_Livro(idAreaConhecimento,idLivro) values(@idArea,@idLivro)
					print 'O id da Área e livro foram inseridos com sucesso'
				end
		end try
		begin catch
			select  ERROR_NUMBER() AS Numero_erro,
			ERROR_MESSAGE() AS Mensagem_erro;
		end catch
	end

go


CREATE PROCEDURE sp_AlterarAreaLivro
	@idAreaAtual int,
	@idLivroAtual int,
	@idAreaNovo int = NULL,
	@idLivroNovo int = NULL
	as
	begin
		begin try
			if not exists (select id from Area_Conhecimento where id = @idAreaAtual) or
			not exists(select id from Livro where id=@idLivroAtual)
				begin
					print 'Erro: O id da Área e/ou do Livro não existe(m)'
				end
			else
			if not exists(select idAreaConhecimento,idLivro from Area_Livro
			where idAreaConhecimento = @idAreaAtual and idLivro = @idLivroAtual)
				begin
					print 'Erro: A combinação do id de Área e livro atuais não existe'
				end
				else
					begin
					update Area_Livro
					set
					idAreaConhecimento= isnull(@idAreaNovo,idAreaConhecimento),
					idLivro= isnull(@idLivroNovo,idLivro)
					where idAreaConhecimento = @idAreaAtual and
					idLivro= @idLivroAtual
					print 'Alterações realizadas com sucesso'
				end
			
		end try
		begin catch
			select  ERROR_NUMBER() AS Numero_erro,
			ERROR_MESSAGE() AS Mensagem_erro;
		end catch
	end

go

CREATE PROCEDURE sp_ExcluirAreaLivro
	@idArea int,
	@idLivro int
	as
	begin
		begin try
			if not exists(select idAreaConhecimento,idLivro from Area_Livro
						where idAreaConhecimento = @idArea and idLivro = @idLivro)
			begin
				print 'Erro: A combinação do id da Área e livro não existe'
			end
		else
		begin
			delete from Area_Livro
			where idAreaConhecimento = @idArea and idLivro = @idLivro
		end
		end try
		begin catch
			select  ERROR_NUMBER() AS Numero_erro,
			ERROR_MESSAGE() AS Mensagem_erro;
		end catch
	end

go


--TABELA ALUNO
CREATE PROCEDURE sp_InserirAluno
	@nome varchar(100),
	@cpf varchar(14),
	@telefone varchar(20),
	@email varchar(100) = NULL,
	@turma varchar(15) = NULL,
	@dataNascimento date,
	@idEndereco int

	as
	begin
		begin try
			if @idEndereco is not null and @idEndereco not in (select id from endereco where id=@idEndereco)
				begin
					print 'Erro: O id do endereço inserido não existe'
				end
			else if @email not like '%@%._%'
				begin 
					print 'Erro: O email inserido não contém um formato válido (email@dominio.com)'
				end
			else
				begin
					insert into Aluno(nome,cpf,telefone,email,turma,
					data_nascimento,idEndereco)
					values(@nome,replace(replace(@cpf,'.',''),'-',''),replace(replace(@telefone,'.',''),'-',''),@email,@turma,@dataNascimento,@idEndereco)
					print 'Informações inseridas com sucesso'
				end
		end try
		begin catch
			select  ERROR_NUMBER() AS Numero_erro,
			ERROR_MESSAGE() AS Mensagem_erro;
		end catch
	end
go

CREATE PROCEDURE sp_AlterarAluno
	@idAluno int,
	@nome varchar(100) = NULL,
	@cpf varchar(14) = NULL,
	@telefone varchar(20) = NULL,
	@email varchar(100) = NULL,
	@turma varchar(15) = NULL,
	@dataNascimento date = NULL,
	@idEndereco int = NULL
	as
	begin
		begin try
			if not exists(select id from Aluno where id=@idAluno)
				begin
					print 'Erro: O id do Aluno inserido não existe'
				end
			else if @email not like '%@%._%'
				begin 
					print 'Erro: O email inserido não contém um formato válido (email@dominio.com)'
				end
			else
				begin
					set @cpf = replace(replace(@cpf,'.',''),'-','');
					set @telefone = replace(@telefone,'-','');
					update Aluno
					set nome = isnull(@nome,nome),
						cpf = isnull(@cpf,cpf),
						telefone = isnull(@telefone,telefone),
						email = isnull(@email,email),
						turma = isnull(@turma,turma),
						data_nascimento = isnull(@dataNascimento,data_nascimento),
						idEndereco = isnull(@idEndereco,idEndereco)
						where id = @idAluno
						print 'Alterações realizadas com sucesso'
				end
		end try
		begin catch
			select  ERROR_NUMBER() AS Numero_erro,
			ERROR_MESSAGE() AS Mensagem_erro;
		end catch
	end;

go

CREATE PROCEDURE sp_ExcluirAluno
	@idAluno int
	as
	begin
		begin try
			if not exists(select id from Aluno where id = @idAluno)
				begin
					print 'Erro: O id do aluno informado não existe'
				end
			else
				begin
					delete from Aluno
					where id = @idAluno
				end
		end try
		begin catch
			select  ERROR_NUMBER() AS Numero_erro,
			ERROR_MESSAGE() AS Mensagem_erro;
		end catch
	end;
go

--TABELA EXEMPLAR

/*
ESTADO - OK
ENDEREÇO  - OK
CIDADE - OK

ALUNO - OK

AREACONHECIMENTO - OK
AUTOR - OK
AUTOR_LIVRO - OK
AREA_LIVRO - OK
LIVRO - OK
EDITORA - OK

EXEMPLAR
EXEMPLAR_EMPRESTADO

*/

CREATE PROCEDURE sp_InserirExemplar
	@idLivro int
	as
	begin
		begin try
			if not exists (select id from livro where id =@idLivro)
				begin
					print 'Erro: O id do livro informado não existe.'
				end
			else
				begin
					insert into Exemplar(status,idLivro) values (0,@idLivro)
					print 'Exemplar inserido com sucesso'
				end
		end try
		begin catch
			select  ERROR_NUMBER() AS Numero_erro,
			ERROR_MESSAGE() AS Mensagem_erro;
		end catch
	end
go

CREATE PROCEDURE sp_AlterarExemplar
	@idExemplar int,
	@status int = NULL,
	@idLivro int = NULL
	as
	begin
		begin try
			if not exists(select id from Exemplar where id = @idExemplar)
				begin
					print 'Erro: O id informado não existe'
				end
			else if not exists(select id from livro where id=@idLivro) and (@idLivro is not null)
				begin
					print 'Erro: O id do livro informado não existe'
				end
			else if exists (select id from Exemplar where id=@idExemplar and id in (select idExemplar from Exemplar_Emprestado))
				begin
					print 'Erro: O status não pode ser alterado quando o exemplar estiver emprestado'
				end
			else if @status not in(2,3) --  -2 manutenção, -3 destruído/perdido
				begin
					print 'Erro: Somente é possível realizar a alteração manual do status para:' +char(13)+ char(10)+'manutenção(2) e perdido/destruído(3).'
				end
			else
				begin
					update Exemplar
					set status = isnull(@status,status),
						idLivro = isnull(@idLivro,idLivro)
						where id=@idExemplar
					print 'Informações alteradas com sucesso'
				end
		end try
		begin catch
			select  ERROR_NUMBER() AS Numero_erro,
			ERROR_MESSAGE() AS Mensagem_erro;
		end catch
	end
go

CREATE PROCEDURE sp_ExcluirExemplar
	@idExemplar int
	as
	begin
		begin try
			if not exists(select id from exemplar where id = @idExemplar)
				begin
					print 'Erro: O id informado não existe'
				end
			else 
				begin
					delete from Exemplar
					where id = @idExemplar
				end
		end try
		begin catch
			select  ERROR_NUMBER() AS Numero_erro,
			ERROR_MESSAGE() AS Mensagem_erro;
		end catch
	end;

go


-- TABELA EXEMPLAR_EMPRESTADO

CREATE PROCEDURE sp_InserirExemplarEmprestado
	@idAluno int,
	@idExemplar int
	-- retirei a entrada do parametro data_Emprestimo, ISSO PODERIA DAR PROBLEMA NO HISTÓRICO, MELHOR DEIXAR COMO OBRIGATÓRIO
	as
	begin
		begin try
			if not exists (select id from Aluno where id = @idAluno)
				begin
					print 'Erro: O id do aluno informado não existe'
				end
			else if not exists (select id from Exemplar where id = @idExemplar)
				begin
					print 'Erro: O id do Exemplar informado não existe'
				end
			else if exists(select status from Exemplar where id=@idExemplar and status in (1,2,3))
				begin
					print 'O id do exemplar informado não está disponível'
				end
			else if (select count(a.id) from Exemplar_Emprestado e,Aluno a 
			where a.id=e.idAluno and idaluno=@idAluno) >=2
				begin
					print 'O aluno já possui o valor máximo permitido de empréstimos em vigência(2)'
				end
			else
				begin
					insert into Exemplar_Emprestado(idAluno,idExemplar)
					values(@idAluno,@idExemplar)
				end
		end try
		begin catch
			select  ERROR_NUMBER() AS Numero_erro,
			ERROR_MESSAGE() AS Mensagem_erro;
		end catch
	end
go

CREATE PROCEDURE sp_AlterarExemplarEmprestado -- Não vai ser permitido alteração no exemplar
-- ou aluno por segurança/integridade dos dados
	@idEmprestimo int,
	@data_devolucao date
	as
	begin
		begin try
			if not exists (select id from Exemplar_Emprestado where id=@idEmprestimo)
				begin
					print 'Erro: O id do empréstimo não existe'
				end
			else if exists (select 'a nova data de devolucao é menor' from Exemplar_Emprestado 
			where id=@idEmprestimo and @data_devolucao < data_devolucao_estimada)
				begin
					print 'Erro: O prazo da devolução não pode ser anterior do que a data atual de devolução'
				end
			else if datediff(day,(select data_emprestimo from Exemplar_Emprestado where id=@idEmprestimo),@data_devolucao)>20
				begin
					print 'Erro:Não é possível renovar o prazo de devolução para um valor superior a 20 dias da data do empréstimo'
				end
			else
				begin
					update Exemplar_Emprestado
					set data_devolucao_estimada=isnull(@data_devolucao,data_devolucao_estimada)
						where id=@idEmprestimo;
				end
		end try
		begin catch
			select  ERROR_NUMBER() AS Numero_erro,
			ERROR_MESSAGE() AS Mensagem_erro;
		end catch
	end
go

CREATE PROCEDURE sp_ExcluirExemplarEmprestado
	@idEmprestimo int,
	@statusDevolucao int = 0, -- Mesmos valores da tabela exemplar (status)
	@descricao text =null
	as
	begin
		begin try
			if not exists(select id from Exemplar_Emprestado where id = @idEmprestimo)
				begin
					;throw 51000, 'Erro: O id do empréstimo informado não existe.', 1;
				end
			else if @statusDevolucao = 1 or @statusDevolucao not in(0,1,2,3)
				begin
					;throw 52000, 'O status não pode ser definido como emprestado durante a devolução ou o status tem um valor inválido', 1;	
				end
			else
				begin
					begin transaction;

					update Exemplar
						set status= @statusDevolucao
							where id = (select idExemplar 
										from Exemplar_Emprestado 
										where id = @idEmprestimo)

					insert into historico(data_emprestimo,data_devolucao_estimada,
					data_devolucao_final,data_pagamento_multa,idEmprestimo,idExemplar,
					idAluno,status_livro_devolucao,descricao)
					select data_emprestimo,data_devolucao_estimada,cast(getdate()as date),
					null,id,idExemplar,idAluno,@statusDevolucao,@descricao
					from Exemplar_Emprestado where id=@idEmprestimo

					delete from Exemplar_Emprestado
					where id=@idEmprestimo
					
				
					commit;
				end
		end try
		begin catch
			if @@TRANCOUNT>0
				begin
					rollback;
				end
				;throw;
		end catch
	end

go


--SP3
-- STORED PROCEDURES 3
--VISUALIZAR

CREATE PROCEDURE sp_VerMultas
	as
	begin
		begin try

			select *,
			case 
				when datediff(day,data_devolucao_estimada,data_devolucao_final) > 0 
				then datediff(day,data_devolucao_estimada,data_devolucao_final)*0.5
				else 0.00
			end as Multa_Atraso,
			case status_livro_devolucao
				when 0 then 0.00
				when 2 then 50.00
				when 3 then 300.00
				else 0.00
			end as Multa_Avariado_Ou_Inutilizado,
			(case 
				when datediff(day,data_devolucao_estimada,data_devolucao_final) > 0 
				then datediff(day,data_devolucao_estimada,data_devolucao_final)*0.5
				else 0.00
			end)
			+
			(case status_livro_devolucao
				when 0 then 0.00
				when 2 then 50.00
				when 3 then 300.00
				else 0.00
			end) as Valor_Total_Multa
			
			from historico
			where (data_devolucao_final>data_devolucao_estimada 
			or status_livro_devolucao in (2,3)) and data_pagamento_multa is null

		end try
		begin catch
			;throw;
		end catch

	end
go
--PAGAR A MULTA

CREATE PROCEDURE sp_PagarMulta
	@idMulta int
	as
	begin
		begin try
			update Historico
			set data_pagamento_multa = cast(getdate()as date)
			where id  = @idMulta
		end try
		begin catch
			;throw;
		end catch
	end

go
-- Ver todos os livros com filtro opcional de status (disponíveis,emprestados,em manutenção e indisponíveis)

CREATE PROCEDURE sp_VerExemplares
	@status int = NULL
	as
	begin
		begin try
			if @status is null
				begin
					select
					case e.status when 0 then 'Disponível'
					when 1 then 'Emprestado'
					when 2 then 'Em manutenção'
					when 3 then 'Quebrado/Perdido' end as Tipo_status,
					l.titulo 'Livro',ed.nome 'Editora'
					from Exemplar e,Livro l,Editora ed
					where e.idLivro = l.id and ed.id = l.idEditora
				end
			else if @status not in (0,1,2,3)
				begin
					;throw 50002, 'O status informado não existe',1
				end
			else
				begin
					select case e.status when 0 then 'Disponível'
					when 1 then 'Emprestado'
					when 2 then 'Em manutenção'
					when 3 then 'Quebrado/Perdido' end as Tipo_status,
					l.titulo,ed.nome 'Editora'
					from Exemplar e,Livro l,Editora ed
					where e.idLivro = l.id and ed.id = l.idEditora
					and e.status = @status
				end
		end try
		begin catch
			;throw;
		end catch
	end

go

-- Ver apenas as quantidades dos exemplares disponíveis totais
-- pela quantidade em cada status
CREATE PROCEDURE sp_VerQtdExemplaresStatus
	as
	begin
		begin try
			select count(*) as 'Quantidade total',
			count(case when status=0 then 1 end) as 'Disponíveis',
			count(case when status=1 then 1 end) as 'Emprestados',
			count(case when status=2 then 1 end) as 'Em manutenção',
			count(case when status=3 then 1 end) as 'Quebrados / perdidos'
			from Exemplar
		end try
		begin catch
			;throw;
		end catch
	end

go
-- Ver somente os exemplares atrasados 

CREATE PROCEDURE sp_VerExemplaresAtrasados
	as
	begin
		begin try
			select a.nome 'Nome do aluno',datediff(day,data_devolucao_estimada,cast(getdate()as date)) 'Dias de atraso',
			l.titulo as 'Título do Livro'
			from Exemplar_Emprestado ee,Aluno a,livro l,Exemplar e
			where a.id = ee.idAluno and e.id = ee.idExemplar and
			l.id = e.idLivro and datediff(day,data_devolucao_estimada,cast(getdate()as date)) > 0
		end try
		begin catch
			;throw;
		end catch
	end

go

-- Ver quantidade de exemplares de cada livro diferente

CREATE PROCEDURE sp_VerQtdExemplaresLivros
	as
	begin
		begin try
			select  l.titulo,count(e.idLivro) as 'Quantidade exemplares' 
			from Livro l
			left join Exemplar e on e.idLivro = l.id
-- O left join vai fazer aparecer os livros que não possuem exemplares como 0
			group by l.id,l.titulo; 
		end try
		begin catch
			;throw;
		end catch
	end

go
-- Somente para ver todos os alunos ou filtrar por um
CREATE PROCEDURE sp_VerAlunos
	@nome varchar(100) = NULL
	as
	begin
		begin try
			select nome,telefone,email,turma from aluno
			where @nome is null or nome like '%'+ @nome +'%'
		end try
		begin catch
			;throw;
		end catch
	end

go


/* Mostrar autores,seus livros e editoras 
 Opcional pesquisar titulo de livro, nome do autor, ou nome da editora
 */

 CREATE PROCEDURE sp_VerAutoresLivrosEditorasIdiomas
	@titulo varchar(255) = NULL,
	@autor varchar(255)= NULL,
	@editora varchar(100)= NULL,
	@idioma varchar(100)=NULL
	as
	begin
		begin try
			select l.titulo 'Titulo livro',e.nome 'Editora',a.nome 'Autor' from Livro l
			inner join Editora e on e.id = l.idEditora
			inner join Autor_Livro al on al.idLivro = l.id
			inner join Autor a on a.id = al.idAutor
			where (@titulo is null or l.titulo like '%'+@titulo+'%') and 
			(@autor is null or  a.nome like '%'+@autor+'%') and
			(@editora is null or e.nome like '%'+@editora+'%') and
			(@idioma is null or l.idioma like '%'+@idioma+'%')
		end try
		begin catch
			;throw;
		end catch

	end

	go
	/* Alunos e seus empréstimos em aberto // Filtro opcional nome aluno
	*/

	CREATE PROCEDURE Ver_ExemplaresAlunos
	@aluno varchar(100) = NULL
	as
	begin
		begin try
			select a.nome 'Aluno',a.telefone,a.email,a.turma,e.data_emprestimo 'Data empréstimo',e.data_devolucao_estimada 'Prazo Devolução', 
			case 
				when e.data_devolucao_estimada < cast(getdate() as date) then 'Atrasado'
				when e.data_devolucao_estimada >= cast(getdate() as date) then 'No prazo'
				end as 'status'
			from Exemplar_Emprestado e,Aluno a
			where a.id = e.idAluno and (@aluno is null or a.nome like '%'+@aluno+'%')
		end try
		begin catch
			;throw;
		end catch
	end


--TRIGGERS


CREATE TRIGGER trg_InsercaoExemplarEmprestado
on Exemplar_Emprestado
after insert
as
begin
	begin try
		update Exemplar_Emprestado
		set data_devolucao_estimada = dateadd(day,10,data_emprestimo)
		where id in (select id from inserted);

		update Exemplar
		set status=1 -- status 1 = emprestado
		where id in (select idExemplar from inserted)
	end try
	begin catch
		if @@TRANCOUNT > 0 --Evita erros de timeout,conexão..
			begin
				rollback;
				throw;
			end
	end catch
	
end;

go
