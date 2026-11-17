describe('Testes E2E - Sistema Biblioteca Saber', () => {

  beforeEach(() => {
    // Acede à página principal de exemplares e empréstimos
    cy.visit('http://localhost:8080/exemplar');
  });

  it('REQ01 - Deve carregar a lista de alunos no seletor de empréstimo', () => {
    cy.get('select').first().should('exist');
    cy.get('select').first().find('option').should('have.length.greaterThan', 1);
  });

  it('REQ02 - Deve carregar os exemplares disponíveis via endpoint do backend', () => {
    cy.intercept('GET', '**/exemplar/disponiveis').as('getExemplares');
    
    cy.visit('http://localhost:8080/exemplar');
    cy.wait('@getExemplares').its('response.statusCode').should('eq', 200);

    // Valida se o menu dropdown de exemplares foi preenchido dinamicamente
    cy.get('select[name="idExemplar"]').should('be.visible');
    cy.get('select[name="idExemplar"]').find('option').should('have.length.greaterThan', 1);
  });

  it('REQ03 - Deve realizar o registo de novo empréstimo e concluir a devolução', () => {
    cy.intercept('POST', '**/exemplar-emprestado').as('postEmprestimo');

    // Seleciona o primeiro aluno e o primeiro exemplar disponível
    cy.get('select').first().select(1);
    cy.get('select[name="idExemplar"]').select(1);

    // Preenche as datas de empréstimo e devolução prevista
    cy.get('input[type="date"]').first().type('2026-11-11');
    cy.get('input[type="date"]').last().type('2026-11-25');

    // Submete o formulário de registo
    cy.contains('button', 'Registrar').click();

    // Valida a resposta bem-sucedida do servidor
    cy.wait('@postEmprestimo').its('response.statusCode').should('be.oneOf', [200, 201]);

    // Valida se o registo apareceu na tabela de empréstimos ativos
    cy.get('table').should('contain', 'Ativo');

    // Valida o acesso ao histórico geral
    cy.visit('http://localhost:8080/historico');
    cy.get('h1').should('contain', 'Histórico de Empréstimos');
  });

});