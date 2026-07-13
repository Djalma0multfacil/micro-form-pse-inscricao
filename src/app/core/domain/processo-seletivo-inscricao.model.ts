export interface ProcessoSeletivoInscricao {
  uuid: string;
  numeroInscricao?: number;
  status?: string;
  nome: string;
  dataNascimento?: string;
  cpf: string;
  email: string;
  telefone?: string;
  pcd?: boolean;
  afrodescendente?: boolean;
}

export interface ProcessoSeletivoInscricaoPayload {
  nome: string;
  cpf: string;
  email: string;
  dataNascimento?: string;
  telefone?: string;
  pcd?: boolean;
  afrodescendente?: boolean;
  tbprocessoSeletivoId?: number;
}
