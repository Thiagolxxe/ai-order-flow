
import { Database } from './types';

// Tipos de funções de usuário
export type UserRole = 'cliente' | 'restaurante' | 'entregador' | 'admin' | null;

// Tipo para endereços
export type AddressType = {
  id: string;
  label: string;
  endereco: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  isDefault: boolean;
};

// Tipo para notificações
export type Notification = {
  id: string;
  type: 'order' | 'promo' | 'system'; // Alinhado com o enum do banco de dados
  title: string;
  message: string;
  read: boolean;
  date: string;
};

// Função auxiliar para mapear dados da tabela de endereços para o tipo AddressType
export const mapDbAddressToAddressType = (dbAddress: any): AddressType => ({
  id: dbAddress.id,
  label: dbAddress.label,
  endereco: dbAddress.endereco,
  complemento: dbAddress.complemento,
  bairro: dbAddress.bairro,
  cidade: dbAddress.cidade,
  estado: dbAddress.estado,
  cep: dbAddress.cep,
  isDefault: dbAddress.isDefault
});

// Função auxiliar para mapear dados da tabela de notificações para o tipo Notification
export const mapDbNotificationToNotification = (dbNotification: any): Notification => ({
  id: dbNotification.id,
  type: dbNotification.tipo,
  title: dbNotification.titulo,
  message: dbNotification.mensagem,
  read: dbNotification.lida,
  date: dbNotification.data
});

// Tipo para as tabelas do Supabase que estendemos manualmente
export type CustomTables = Database['public']['Tables'] & {
  enderecos: {
    Row: {
      id: string;
      usuario_id: string;
      label: string;
      endereco: string;
      complemento?: string;
      bairro: string;
      cidade: string;
      estado: string;
      cep: string;
      isDefault: boolean;
      criado_em: string;
    };
    Insert: {
      id?: string;
      usuario_id: string;
      label: string;
      endereco: string;
      complemento?: string;
      bairro: string;
      cidade: string;
      estado: string;
      cep: string;
      isDefault?: boolean;
      criado_em?: string;
    };
    Update: {
      id?: string;
      usuario_id?: string;
      label?: string;
      endereco?: string;
      complemento?: string;
      bairro?: string;
      cidade?: string;
      estado?: string;
      cep?: string;
      isDefault?: boolean;
      criado_em?: string;
    };
  }
};

// Helper para tipar o Supabase corretamente com nossas tabelas personalizadas
export type TypedSupabaseClient = Database['public'] & CustomTables;
