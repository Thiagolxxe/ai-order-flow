
export interface AddressType {
  id: string;
  usuario_id: string;
  label: string;
  endereco: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  isdefault: boolean; // Changed to lowercase to match DB column name
  criado_em?: string;
}

export interface NotificationType {
  id: string;
  usuario_id: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  id_relacionado: string;
  lida: boolean;
  criado_em: string;
}

export type UserRole = 'cliente' | 'restaurante' | 'entregador' | 'admin' | 'guest';
