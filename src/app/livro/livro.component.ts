import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-livro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './livro.component.html',
  styleUrl: './livro.component.css',
})
export class LivroComponent {
  // Ajustado para a porta 4000 do seu backend local
  private readonly API = 'http://localhost:4000';

  idEditora: number | null = null;
  idLivro: number | null = null;
  idAutor: number | null = null;
  idArea: number | null = null;

  stepAtivo = 1;
  stepsCompletos: number[] = [];

  nomeEditora = '';
  titulo = '';
  isbn = '';
  idioma = '';
  ano = '';
  nomeAutor = '';
  nomeArea = '';

  msgEditora = '';
  msgLivro = '';
  msgAutor = '';
  msgArea = '';
  tipoMsgEditora: 'erro' | 'ok' = 'erro';
  tipoMsgLivro: 'erro' | 'ok' = 'erro';
  tipoMsgAutor: 'erro' | 'ok' = 'erro';
  tipoMsgArea: 'erro' | 'ok' = 'erro';

  loadingEditora = false;
  loadingLivro = false;
  loadingAutor = false;
  loadingArea = false;

  tagEditoraVisivel = false;
  tagLivroVisivel = false;
  tagAutorVisivel = false;
  tagAreaVisivel = false;

  cadastroConcluido = false;

  // Injetando ChangeDetectorRef para forçar a renderização imediata pós-requisição
  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  isStepCompleto(n: number): boolean {
    return this.stepsCompletos.includes(n);
  }

  isStepLocked(n: number): boolean {
    return n > this.stepAtivo && !this.isStepCompleto(n);
  }

  private completeStep(n: number): void {
    if (!this.stepsCompletos.includes(n)) {
      this.stepsCompletos.push(n);
    }
  }

  private unlockStep(n: number): void {
    this.stepAtivo = n;
  }

  async salvarEditora(): Promise<void> {
    const nome = this.nomeEditora.trim();
    if (!nome) {
      this.msgEditora = 'Informe o nome da editora.';
      this.tipoMsgEditora = 'erro';
      return;
    }
    this.loadingEditora = true;
    this.msgEditora = '';
    this.cdr.detectChanges();

    try {
      const resPost = await firstValueFrom(
        this.http.post<any>(`${this.API}/editoras`, { nome })
      );
      
      // Tenta capturar ID direto do POST, senão faz Fallback com GET
      if (resPost && resPost.id) {
        this.idEditora = resPost.id;
      } else {
        const lista = await firstValueFrom(
          this.http.get<any[]>(`${this.API}/editoras?busca=${encodeURIComponent(nome)}`)
        );
        this.idEditora = lista?.[0]?.id ?? null;
      }

      if (!this.idEditora) throw new Error('Editora não encontrada.');
      
      this.msgEditora = `Editora "${nome}" confirmada! ID: ${this.idEditora}`;
      this.tipoMsgEditora = 'ok';
      this.tagEditoraVisivel = true;
      this.completeStep(1);
      this.unlockStep(2);
    } catch (err: any) {
      this.msgEditora = `Erro: ${err.message || 'Falha na conexão'}`;
      this.tipoMsgEditora = 'erro';
    } finally {
      this.loadingEditora = false;
      this.cdr.detectChanges();
    }
  }

  async salvarLivro(): Promise<void> {
    const titulo = this.titulo.trim();
    if (!titulo) {
      this.msgLivro = 'O título é obrigatório.';
      this.tipoMsgLivro = 'erro';
      return;
    }
    this.loadingLivro = true;
    this.msgLivro = '';
    this.cdr.detectChanges();

    try {
      const resPost = await firstValueFrom(
        this.http.post<any>(`${this.API}/livros`, {
          titulo,
          isbn: this.isbn || null,
          idioma: this.idioma || null,
          anoPublicacao: this.ano ? `${this.ano}-01-01` : null,
          idEditora: this.idEditora,
        })
      );

      if (resPost && resPost.id) {
        this.idLivro = resPost.id;
      } else {
        const lista = await firstValueFrom(
          this.http.get<any[]>(`${this.API}/livros?busca=${encodeURIComponent(titulo)}`)
        );
        this.idLivro = lista?.[0]?.id ?? null;
      }

      if (!this.idLivro) throw new Error('Livro não encontrado após salvar.');
      
      this.msgLivro = `Livro "${titulo}" salvo! ID: ${this.idLivro}`;
      this.tipoMsgLivro = 'ok';
      this.tagLivroVisivel = true;
      this.completeStep(2);
      this.unlockStep(3);
    } catch (err: any) {
      this.msgLivro = `Erro: ${err.message || 'Falha na conexão'}`;
      this.tipoMsgLivro = 'erro';
    } finally {
      this.loadingLivro = false;
      this.cdr.detectChanges();
    }
  }

  async salvarAutor(): Promise<void> {
    const nome = this.nomeAutor.trim();
    if (!nome) {
      this.msgAutor = 'Informe o nome do autor.';
      this.tipoMsgAutor = 'erro';
      return;
    }
    this.loadingAutor = true;
    this.msgAutor = '';
    this.cdr.detectChanges();

    try {
      const resPost = await firstValueFrom(
        this.http.post<any>(`${this.API}/autores`, { nome })
      );

      if (resPost && resPost.id) {
        this.idAutor = resPost.id;
      } else {
        const lista = await firstValueFrom(
          this.http.get<any[]>(`${this.API}/autores?busca=${encodeURIComponent(nome)}`)
        );
        this.idAutor = lista?.[0]?.id ?? null;
      }

      if (!this.idAutor) throw new Error('Autor não encontrado.');

      await firstValueFrom(
        this.http.post(`${this.API}/autor-livro`, {
          idAutor: this.idAutor,
          idLivro: this.idLivro,
        })
      );
      this.msgAutor = `Autor "${nome}" vinculado! ID: ${this.idAutor}`;
      this.tipoMsgAutor = 'ok';
      this.tagAutorVisivel = true;
      this.completeStep(3);
      this.unlockStep(4);
    } catch (err: any) {
      this.msgAutor = `Erro: ${err.message || 'Falha na conexão'}`;
      this.tipoMsgAutor = 'erro';
    } finally {
      this.loadingAutor = false;
      this.cdr.detectChanges();
    }
  }

  async salvarArea(): Promise<void> {
    const nome = this.nomeArea.trim();
    if (!nome) {
      this.msgArea = 'Informe o nome da área.';
      this.tipoMsgArea = 'erro';
      return;
    }
    this.loadingArea = true;
    this.msgArea = '';
    this.cdr.detectChanges();

    try {
      const resPost = await firstValueFrom(
        this.http.post<any>(`${this.API}/areas-conhecimento`, { nome })
      );

      if (resPost && resPost.id) {
        this.idArea = resPost.id;
      } else {
        const lista = await firstValueFrom(
          this.http.get<any[]>(`${this.API}/areas-conhecimento?busca=${encodeURIComponent(nome)}`)
        );
        this.idArea = lista?.[0]?.id ?? null;
      }

      if (!this.idArea) throw new Error('Área não encontrada.');

      await firstValueFrom(
        this.http.post(`${this.API}/area-livro`, {
          idArea: this.idArea,
          idLivro: this.idLivro,
        })
      );
      this.msgArea = `✅ Livro cadastrado com sucesso! Área "${nome}" vinculada.`;
      this.tipoMsgArea = 'ok';
      this.tagAreaVisivel = true;
      this.completeStep(4);
      this.cadastroConcluido = true;
    } catch (err: any) {
      this.msgArea = `Erro: ${err.message || 'Falha na conexão'}`;
      this.tipoMsgArea = 'erro';
    } finally {
      this.loadingArea = false;
      this.cdr.detectChanges();
    }
  }

  novoCadastro(): void {
    this.idEditora = null;
    this.idLivro = null;
    this.idAutor = null;
    this.idArea = null;

    this.stepAtivo = 1;
    this.stepsCompletos = [];

    this.nomeEditora = '';
    this.titulo = '';
    this.isbn = '';
    this.idioma = '';
    this.ano = '';
    this.nomeAutor = '';
    this.nomeArea = '';

    this.msgEditora = '';
    this.msgLivro = '';
    this.msgAutor = '';
    this.msgArea = '';

    this.tagEditoraVisivel = false;
    this.tagLivroVisivel = false;
    this.tagAutorVisivel = false;
    this.tagAreaVisivel = false;

    this.cadastroConcluido = false;
    this.cdr.detectChanges();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}