
/**
 * This is a mock Supabase client for transitioning away from Supabase.
 * We're migrating to MongoDB but still have some references to Supabase.
 * This provides a compatible interface to avoid breaking changes.
 */

// Define some common mock data for consistent responses
const mockRestaurant = {
  id: 'mock-id',
  nome: 'Mock Restaurant',
  logo_url: 'https://example.com/logo.png',
  banner_url: 'https://example.com/banner.png',
  tipo_cozinha: 'Italian',
  taxa_entrega: 5.0,
  valor_pedido_minimo: 20.0,
  tempo_entrega_estimado: 30,
  faixa_preco: 2
};

const mockOrder = {
  id: 'mock-id',
  numero_pedido: 'ORD-123456',
  status: 'pendente',
  restaurante_id: 'mock-restaurant-id',
  endereco_entrega: '123 Main St',
  cidade_entrega: 'Example City',
  estado_entrega: 'EX',
  criado_em: new Date().toISOString(),
  subtotal: 50.0,
  taxa_entrega: 5.0,
  total: 55.0,
  entregador_id: 'mock-driver-id',
  status_pagamento: 'pendente',
  restaurantes: { 
    nome: 'Mock Restaurant',
    id: 'mock-restaurant-id'
  }
};

const mockProfile = {
  id: 'mock-id',
  nome: 'John',
  sobrenome: 'Doe',
  telefone: '555-123-4567'
};

const mockMenuItem = {
  id: 'mock-id',
  nome: 'Mock Item',
  preco: 15.0,
  restaurante_id: 'mock-restaurant-id',
  restaurantes: {
    nome: 'Mock Restaurant'
  }
};

const mockCoupon = {
  id: 'mock-id',
  codigo: 'DISCOUNT10',
  valor: 10,
  tipo: 'percentual',
  restaurante_id: 'mock-restaurant-id',
  valor_pedido_minimo: 20.0,
  data_inicio: new Date(Date.now() - 86400000).toISOString(),
  data_fim: new Date(Date.now() + 86400000).toISOString(),
  ativo: true
};

export const supabase = {
  auth: {
    getSession: async () => ({ 
      data: { session: null } 
    }),
    signUp: async (data: any) => ({ 
      data: {
        user: { id: 'mock-user-id', email: data?.email },
        session: {
          user: { id: 'mock-user-id', email: data?.email },
          access_token: 'mock-token',
          refresh_token: 'mock-refresh-token'
        }
      }, 
      error: null
    }),
    signIn: async (data: any) => ({ 
      data: {
        user: { id: 'mock-user-id', email: data?.email },
        session: {
          user: { id: 'mock-user-id', email: data?.email },
          access_token: 'mock-token',
          refresh_token: 'mock-refresh-token'
        }
      }, 
      error: null
    }),
    setSession: async (data: any) => ({
      data: { session: data },
      error: null
    })
  },
  from: (table: string) => ({
    select: (columns?: string) => ({
      eq: (column: string, value: any) => ({
        lte: (column: string, value: any) => ({
          gte: (column: string, value: any) => ({
            maybeSingle: async () => mockResponseForTable(table),
            single: async () => mockResponseForTable(table),
            toArray: async () => ({ data: [mockDataForTable(table)], error: null })
          }),
          maybeSingle: async () => mockResponseForTable(table),
          single: async () => mockResponseForTable(table),
          toArray: async () => ({ data: [mockDataForTable(table)], error: null })
        }),
        in: (column: string, values: any[]) => ({
          toArray: async () => ({ data: [mockDataForTable(table)], error: null })
        }),
        order: (column: string, { ascending }: { ascending: boolean }) => ({
          limit: (limit: number) => ({
            toArray: async () => ({ data: [mockDataForTable(table)], error: null })
          }),
          toArray: async () => ({ data: [mockDataForTable(table)], error: null })
        }),
        limit: (limit: number) => ({
          toArray: async () => ({ data: [mockDataForTable(table)], error: null })
        }),
        ilike: (column: string, value: any) => ({
          toArray: async () => ({ data: [mockDataForTable(table)], error: null })
        }),
        or: (orConditions: string) => ({
          toArray: async () => ({ data: [mockDataForTable(table)], error: null })
        }),
        in: (column: string, values: any[]) => ({
          toArray: async () => ({ data: [mockDataForTable(table)], error: null })
        }),
        toArray: async () => ({ data: [mockDataForTable(table)], error: null }),
        maybeSingle: async () => mockResponseForTable(table),
        single: async () => mockResponseForTable(table)
      }),
      in: (column: string, values: any[]) => ({
        toArray: async () => ({ data: [mockDataForTable(table)], error: null })
      }),
      order: (column: string, { ascending }: { ascending: boolean }) => ({
        limit: (limit: number) => ({
          toArray: async () => ({ data: [mockDataForTable(table)], error: null })
        }),
        toArray: async () => ({ data: [mockDataForTable(table)], error: null })
      }),
      limit: (limit: number) => ({
        toArray: async () => ({ data: [mockDataForTable(table)], error: null })
      }),
      ilike: (column: string, value: any) => ({
        toArray: async () => ({ data: [mockDataForTable(table)], error: null })
      }),
      or: (orConditions: string) => ({
        toArray: async () => ({ data: [mockDataForTable(table)], error: null })
      }),
      eq: (column: string, value: any) => ({
        toArray: async () => ({ data: [mockDataForTable(table)], error: null }),
        single: async () => mockResponseForTable(table),
        maybeSingle: async () => mockResponseForTable(table)
      }),
      toArray: async () => ({ data: [mockDataForTable(table)], error: null }),
      single: async () => mockResponseForTable(table),
      maybeSingle: async () => mockResponseForTable(table)
    }),
    insert: (data: any) => ({
      select: (columns?: string) => ({
        single: async () => mockResponseForTable(table)
      }),
      single: async () => mockResponseForTable(table)
    }),
    upsert: (data: any) => ({
      select: (columns?: string) => ({
        single: async () => mockResponseForTable(table)
      }),
      single: async () => mockResponseForTable(table)
    })
  }),
  channel: (channelName: string) => ({
    on: (eventType: string, eventConfig: any, callback: Function) => ({
      subscribe: () => {}
    })
  }),
  removeChannel: (channel: any) => {}
};

// Helper function to get appropriate mock data based on table name
function mockDataForTable(table: string): any {
  switch (table) {
    case 'restaurantes':
      return mockRestaurant;
    case 'pedidos':
      return mockOrder;
    case 'perfis':
      return mockProfile;
    case 'itens_cardapio':
      return mockMenuItem;
    case 'promocoes':
      return mockCoupon;
    case 'entregadores':
      return { id: 'mock-id', tipo_veiculo: 'Moto', latitude_atual: -23.5505, longitude_atual: -46.6333 };
    case 'enderecos':
      return { 
        id: 'mock-id', 
        endereco: '123 Main St', 
        complemento: 'Apt 4B', 
        bairro: 'Centro', 
        cidade: 'São Paulo', 
        estado: 'SP', 
        cep: '01234-567',
        isdefault: true
      };
    default:
      return { id: 'mock-id' };
  }
}

// Helper function to format response object consistently
function mockResponseForTable(table: string): { data: any, error: null } {
  return { data: mockDataForTable(table), error: null };
}
