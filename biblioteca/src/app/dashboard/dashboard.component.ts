import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private readonly API = 'http://localhost:4000';

  // ─── Contadores ────────────────────────────────────────────
  totalAlunos = 0;
  totalLivros = 0;
  totalExemplares = 0;
  totalEmprestimosAtivos = 0;
  carregandoContadores = true;

  // ─── Status ────────────────────────────────────────────────
  statusServidor: 'online' | 'offline' | 'verificando' = 'verificando';

  // ─── Busca ─────────────────────────────────────────────────
  tabelaSelecionada = 'Aluno';
  termoBusca = '';
  ultimaBusca = '';
  resultados: any[] = [];
  colunas: string[] = [];
  carregandoBusca = false;
  buscaRealizada = false;
  erroBusca = '';

  // Injetamos o ChangeDetectorRef no construtor
  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.verificarServidor();
    this.carregarContadores();
  }

  verificarServidor() {
    this.http.get(`${this.API}/alunos`).subscribe({
      next: () => {
        this.statusServidor = 'online';
        this.cdr.detectChanges(); // Força atualização da badge
      },
      error: () => {
        this.statusServidor = 'offline';
        this.cdr.detectChanges(); // Força atualização da badge
      },
    });
  }

  carregarContadores() {
    this.carregandoContadores = true;
    this.cdr.detectChanges(); // Força o estado de "carregando..." na tela

    forkJoin({
      alunos: this.http.get<any[]>(`${this.API}/alunos`).pipe(catchError(() => of([]))),
      livros: this.http.get<any[]>(`${this.API}/livros`).pipe(catchError(() => of([]))),
      exemplares: this.http.get<any[]>(`${this.API}/exemplares`).pipe(catchError(() => of([]))),
      emprestimos: this.http.get<any[]>(`${this.API}/exemplar-emprestado`).pipe(catchError(() => of([])))
    }).subscribe({
      next: (data) => {
        this.totalAlunos = data.alunos?.length ?? 0;
        this.totalLivros = data.livros?.length ?? 0;
        this.totalExemplares = data.exemplares?.length ?? 0;
        
        if (data.emprestimos && Array.isArray(data.emprestimos)) {
          this.totalEmprestimosAtivos = data.emprestimos.filter(
            (e) => !e.dataDevolucao
          ).length;
        } else {
          this.totalEmprestimosAtivos = 0;
        }
        
        this.carregandoContadores = false;
        this.cdr.detectChanges(); // CRUCIAL: Avisa o HTML que os contadores chegaram!
      },
      error: () => {
        this.carregandoContadores = false;
        this.statusServidor = 'offline';
        this.cdr.detectChanges(); // Avisa o HTML em caso de erro
      },
    });
  }

  // ─── Mapeamentos da Pesquisa Avançada ───────────────────────

  get endpointMap(): Record<string, string> {
    return {
      Aluno: 'alunos',
      Livro: 'livros',
      Autor: 'autores',
      Editora: 'editoras',
      Cidade: 'cidades',
      Area_Conhecimento: 'areas-conhecimento',
      Exemplar: 'exemplares',
    };
  }

  get colunasMap(): Record<string, string[]> {
    return {
      Aluno: ['id', 'nome', 'cpf', 'telefone', 'email', 'turma'],
      Livro: ['id', 'titulo', 'idioma', 'isbn'],
      Autor: ['id', 'nome'],
      Editora: ['id', 'nome'],
      Cidade: ['id', 'nome'],
      Area_Conhecimento: ['id', 'nome'],
      Exemplar: ['id', 'numero_exemplar', 'titulo_livro', 'status_exemplar'],
    };
  }

  get labelMap(): Record<string, string> {
    return {
      id: 'ID',
      nome: 'Nome',
      cpf: 'CPF',
      telefone: 'Telefone',
      email: 'E-mail',
      turma: 'Turma',
      titulo: 'Título',
      idioma: 'Idioma',
      isbn: 'ISBN',
      numero_exemplar: 'Nº Exemplar',
      titulo_livro: 'Livro',
      status_exemplar: 'Status',
    };
  }

  // ─── Lógica de Execução da Busca ────────────────────────────

  executarBuscaGeral() {
    const endpoint = this.endpointMap[this.tabelaSelecionada];
    if (!endpoint) return;

    this.carregandoBusca = true;
    this.buscaRealizada = false;
    this.erroBusca = '';
    this.resultados = [];
    this.ultimaBusca = this.termoBusca.trim() || 'Todos os registros';
    this.cdr.detectChanges(); // Mostra o spinner de "Buscando..." imediatamente

    this.http
      .get<any[]>(`${this.API}/${endpoint}?busca=${encodeURIComponent(this.termoBusca.trim())}`)
      .subscribe({
        next: (data) => {
          this.resultados = data ?? [];
          this.colunas = this.colunasMap[this.tabelaSelecionada] ?? [];
          this.carregandoBusca = false;
          this.buscaRealizada = true;
          this.cdr.detectChanges(); // CRUCIAL: Força a tabela a renderizar os dados na hora!
        },
        error: (err) => {
          this.erroBusca = err?.error?.erro ?? err?.message ?? 'Erro ao conectar com a API.';
          this.carregandoBusca = false;
          this.buscaRealizada = true;
          this.cdr.detectChanges(); // Mostra o erro na tela imediatamente
        },
      });
  }

  limparBuscaGeral() {
    this.termoBusca = '';
    this.ultimaBusca = '';
    this.resultados = [];
    this.colunas = [];
    this.buscaRealizada = false;
    this.erroBusca = '';
    this.cdr.detectChanges(); // Limpa a tela instantaneamente
  }

  formatarLabel(col: string): string {
    return this.labelMap[col] ?? col;
  }

  formatarValor(valor: any): string {
    if (valor === null || valor === undefined || valor === '') return '—';
    return String(valor);
  }
}