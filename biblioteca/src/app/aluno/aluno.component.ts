import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface Estado {
  id: number;
  nome: string;
}

interface Cidade {
  id: number;
  nome: string;
  idEstado: number;
}

interface Endereco {
  id: number;
  cep: string;
  logradouro: string;
  bairro: string;
  complemento?: string | null;
  idCidade: number;
}

interface ApiResponse {
  id?: number; // Adicionado para capturar ID direto do POST se disponível
  erro?: string;
  mensagem?: string;
}

interface AlunoPayload {
  nome: string;
  cpf: string;
  telefone: string;
  email?: string | null;
  turma?: string | null;
  dataNascimento: string;
  idEndereco: number;
}

interface EnderecoPayload {
  cep: string;
  logradouro: string;
  bairro: string;
  complemento?: string | null;
  idCidade: number;
}

// ─── Tipos auxiliares ─────────────────────────────────────────────────────────

type TipoMsg = 'erro' | 'ok' | '';

interface MsgState {
  texto: string;
  tipo: TipoMsg;
}

// ─── Component ────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-aluno',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './aluno.component.html',
  styleUrl: './aluno.component.css',
})
export class AlunoComponent {

  // Ajustado para a porta correta vista em image_88895b.png
  private readonly API = 'http://localhost:4000';

  // ─── IDs encadeados ──────────────────────────────────────────────────────

  idEstado: number | null = null;
  idCidade: number | null = null;
  idEndereco: number | null = null;

  // ─── Controle de steps ───────────────────────────────────────────────────

  stepAtivo: number = 1;
  stepsCompletos: Set<number> = new Set();

  // ─── Campos do formulário ────────────────────────────────────────────────

  nomeEstado: string = '';
  nomeCidade: string = '';

  cep: string = '';
  logradouro: string = '';
  bairro: string = '';
  complemento: string = '';

  nomeAluno: string = '';
  cpf: string = '';
  telefone: string = '';
  email: string = '';
  turma: string = '';
  dataNascimento: string = '';

  // ─── Mensagens de feedback ───────────────────────────────────────────────

  msgEstado: MsgState = { texto: '', tipo: '' };
  msgCidade: MsgState = { texto: '', tipo: '' };
  msgEndereco: MsgState = { texto: '', tipo: '' };
  msgAluno: MsgState = { texto: '', tipo: '' };

  // ─── Loading por step ────────────────────────────────────────────────────

  loadingEstado: boolean = false;
  loadingCidade: boolean = false;
  loadingEndereco: boolean = false;
  loadingAluno: boolean = false;

  // ─── Cadastro finalizado ─────────────────────────────────────────────────

  cadastroFinalizado: boolean = false;

  // Injeção do ChangeDetectorRef adicionada para evitar travamentos de UI
  constructor(private http: HttpClient, private cdr: ChangeDetectorRef) {}

  // ─── Helpers de step ─────────────────────────────────────────────────────

  isCompleto(n: number): boolean {
    return this.stepsCompletos.has(n);
  }

  isAtivo(n: number): boolean {
    return this.stepAtivo === n;
  }

  isLocked(n: number): boolean {
    return n > this.stepAtivo && !this.stepsCompletos.has(n);
  }

  private completeStep(n: number): void {
    this.stepsCompletos.add(n);
    this.stepAtivo = n + 1;
  }

  // ─── Salvar Estado ───────────────────────────────────────────────────────

  async salvarEstado(): Promise<void> {
    if (!this.nomeEstado.trim()) {
      this.msgEstado = { texto: 'Informe o nome do estado.', tipo: 'erro' };
      return;
    }

    this.loadingEstado = true;
    this.msgEstado = { texto: '', tipo: '' };
    this.cdr.detectChanges(); // Atualiza o botão para "Salvando..." na hora

    try {
      const resPost = await firstValueFrom(
        this.http.post<ApiResponse & Estado>(`${this.API}/estados`, { nome: this.nomeEstado.trim() })
      );

      // Se o backend retornar o ID criado direto no POST, usamos ele. Senão, faz o GET de busca.
      if (resPost && resPost.id) {
        this.idEstado = resPost.id;
      } else {
        const estados = await firstValueFrom(
          this.http.get<Estado[]>(`${this.API}/estados?busca=${encodeURIComponent(this.nomeEstado.trim())}`)
        );
        this.idEstado = estados?.[0]?.id ?? null;
      }

      this.msgEstado = { texto: `Estado "${this.nomeEstado}" salvo!`, tipo: 'ok' };
      this.completeStep(1);
    } catch (err: unknown) {
      this.msgEstado = { texto: `Erro: ${this.getErroMsg(err)}`, tipo: 'erro' };
    } finally {
      this.loadingEstado = false;
      this.cdr.detectChanges(); // Força o Angular a liberar a tela e abrir o Step 2
    }
  }

  // ─── Salvar Cidade ───────────────────────────────────────────────────────

  async salvarCidade(): Promise<void> {
    if (!this.nomeCidade.trim()) {
      this.msgCidade = { texto: 'Informe o nome da cidade.', tipo: 'erro' };
      return;
    }
    if (!this.idEstado) {
      this.msgCidade = { texto: 'Estado não encontrado no fluxo.', tipo: 'erro' };
      return;
    }

    this.loadingCidade = true;
    this.msgCidade = { texto: '', tipo: '' };
    this.cdr.detectChanges();

    try {
      const resPost = await firstValueFrom(
        this.http.post<ApiResponse & Cidade>(`${this.API}/cidades`, {
          nome: this.nomeCidade.trim(),
          idEstado: this.idEstado,
        })
      );

      if (resPost && resPost.id) {
        this.idCidade = resPost.id;
      } else {
        const cidades = await firstValueFrom(
          this.http.get<Cidade[]>(`${this.API}/cidades?busca=${encodeURIComponent(this.nomeCidade.trim())}`)
        );
        this.idCidade = cidades?.[0]?.id ?? null;
      }

      this.msgCidade = { texto: `Cidade "${this.nomeCidade}" salva!`, tipo: 'ok' };
      this.completeStep(2);
    } catch (err: unknown) {
      this.msgCidade = { texto: `Erro: ${this.getErroMsg(err)}`, tipo: 'erro' };
    } finally {
      this.loadingCidade = false;
      this.cdr.detectChanges();
    }
  }

  // ─── Salvar Endereço ─────────────────────────────────────────────────────

  async salvarEndereco(): Promise<void> {
    if (!this.cep.trim() || !this.logradouro.trim() || !this.bairro.trim()) {
      this.msgEndereco = { texto: 'Preencha CEP, logradouro e bairro.', tipo: 'erro' };
      return;
    }
    if (!this.idCidade) {
      this.msgEndereco = { texto: 'Cidade não encontrada no fluxo.', tipo: 'erro' };
      return;
    }

    this.loadingEndereco = true;
    this.msgEndereco = { texto: '', tipo: '' };
    this.cdr.detectChanges();

    const payload: EnderecoPayload = {
      cep: this.cep.trim(),
      logradouro: this.logradouro.trim(),
      bairro: this.bairro.trim(),
      complemento: this.complemento.trim() || null,
      idCidade: this.idCidade,
    };

    try {
      const resPost = await firstValueFrom(
        this.http.post<ApiResponse & Endereco>(`${this.API}/enderecos`, payload)
      );

      if (resPost && resPost.id) {
        this.idEndereco = resPost.id;
      } else {
        const enderecos = await firstValueFrom(
          this.http.get<Endereco[]>(`${this.API}/enderecos`)
        );
        // Pega o último endereço adicionado se a API não retornar ordenado por ID
        this.idEndereco = enderecos?.length ? enderecos[enderecos.length - 1].id : null;
      }

      this.msgEndereco = { texto: 'Endereço cadastrado com sucesso!', tipo: 'ok' };
      this.completeStep(3);
    } catch (err: unknown) {
      this.msgEndereco = { texto: `Erro: ${this.getErroMsg(err)}`, tipo: 'erro' };
    } finally {
      this.loadingEndereco = false;
      this.cdr.detectChanges();
    }
  }

  // ─── Salvar Aluno ────────────────────────────────────────────────────────

  async salvarAluno(): Promise<void> {
    if (!this.nomeAluno.trim() || !this.cpf.trim() || !this.telefone.trim() || !this.dataNascimento) {
      this.msgAluno = { texto: 'Preencha nome, CPF, telefone e data de nascimento.', tipo: 'erro' };
      return;
    }
    if (!this.idEndereco) {
      this.msgAluno = { texto: 'Endereço ausente. Conclua as etapas anteriores.', tipo: 'erro' };
      return;
    }

    this.loadingAluno = true;
    this.msgAluno = { texto: '', tipo: '' };
    this.cdr.detectChanges();

    const payload: AlunoPayload = {
      nome: this.nomeAluno.trim(),
      cpf: this.cpf.trim(),
      telefone: this.telefone.trim(),
      email: this.email.trim() || null,
      turma: this.turma.trim() || null,
      dataNascimento: this.dataNascimento,
      idEndereco: this.idEndereco,
    };

    try {
      const data = await firstValueFrom(
        this.http.post<ApiResponse>(`${this.API}/alunos`, payload)
      );

      this.msgAluno = { texto: data.mensagem ?? 'Aluno salvo com sucesso!', tipo: 'ok' };
      this.completeStep(4);
      this.cadastroFinalizado = true;
    } catch (err: unknown) {
      this.msgAluno = { texto: `Erro: ${this.getErroMsg(err)}`, tipo: 'erro' };
    } finally {
      this.loadingAluno = false;
      this.cdr.detectChanges();
    }
  }

  // ─── Novo Cadastro ───────────────────────────────────────────────────────

  novoCadastro(): void {
    this.idEstado = null;
    this.idCidade = null;
    this.idEndereco = null;

    this.stepAtivo = 1;
    this.stepsCompletos.clear();
    this.cadastroFinalizado = false;

    this.nomeEstado = '';
    this.nomeCidade = '';
    this.cep = '';
    this.logradouro = '';
    this.bairro = '';
    this.complemento = '';
    this.nomeAluno = '';
    this.cpf = '';
    this.telefone = '';
    this.email = '';
    this.turma = '';
    this.dataNascimento = '';

    this.msgEstado = { texto: '', tipo: '' };
    this.msgCidade = { texto: '', tipo: '' };
    this.msgEndereco = { texto: '', tipo: '' };
    this.msgAluno = { texto: '', tipo: '' };

    this.cdr.detectChanges();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ─── Helper de erro HTTP ─────────────────────────────────────────────────

  private getErroMsg(err: unknown): string {
    if (err && typeof err === 'object' && 'error' in err) {
      const httpErr = err as { error?: { erro?: string } };
      return httpErr.error?.erro ?? 'Erro desconhecido no servidor';
    }
    if (err instanceof Error) return err.message;
    return 'Erro de conexão de rede';
  }
}