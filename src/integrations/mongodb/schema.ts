
/**
 * This file defines the MongoDB schema structure for the application.
 * It's for reference only and doesn't affect the actual database.
 */

export const mongoDBSchema = {
  users: {
    _id: 'ObjectId',
    email: 'string',
    password: 'string (hashed)',
    user_metadata: {
      nome: 'string',
      sobrenome: 'string'
    },
    created_at: 'Date'
  },
  
  profiles: {
    _id: 'ObjectId (matches user _id)',
    nome: 'string',
    sobrenome: 'string',
    telefone: 'string',
    endereco: 'string',
    foto_url: 'string',
    created_at: 'Date'
  },
  
  restaurants: {
    _id: 'ObjectId',
    nome: 'string',
    tipo_cozinha: 'string',
    descricao: 'string',
    telefone: 'string',
    endereco: 'string',
    cidade: 'string',
    estado: 'string',
    cep: 'string',
    faixa_preco: 'number',
    proprietario_id: 'ObjectId (reference to users)',
    taxa_entrega: 'number',
    valor_pedido_minimo: 'number',
    tempo_entrega_estimado: 'number',
    ativo: 'boolean',
    logo_url: 'string',
    banner_url: 'string',
    created_at: 'Date',
    updated_at: 'Date'
  },
  
  menu_items: {
    _id: 'ObjectId',
    restaurante_id: 'ObjectId (reference to restaurants)',
    categoria_id: 'ObjectId (reference to categories)',
    nome: 'string',
    descricao: 'string',
    preco: 'number',
    imagem_url: 'string',
    disponivel: 'boolean',
    destaque: 'boolean',
    created_at: 'Date',
    updated_at: 'Date'
  },
  
  categories: {
    _id: 'ObjectId',
    restaurante_id: 'ObjectId (reference to restaurants)',
    nome: 'string',
    descricao: 'string',
    ordem_exibicao: 'number',
    created_at: 'Date'
  },
  
  orders: {
    _id: 'ObjectId',
    numero_pedido: 'string',
    cliente_id: 'ObjectId (reference to users)',
    restaurante_id: 'ObjectId (reference to restaurants)',
    status: 'string (pendente, confirmado, preparando, pronto, em_entrega, entregue, cancelado)',
    subtotal: 'number',
    taxa_entrega: 'number',
    taxa_servico: 'number',
    imposto: 'number',
    gorjeta: 'number',
    total: 'number',
    metodo_pagamento: 'string',
    status_pagamento: 'string',
    endereco_entrega: 'string',
    cidade_entrega: 'string',
    estado_entrega: 'string',
    cep_entrega: 'string',
    instrucoes_entrega: 'string',
    tempo_entrega_estimado: 'Date',
    entregador_id: 'ObjectId (reference to drivers)',
    created_at: 'Date',
    updated_at: 'Date'
  },
  
  order_items: {
    _id: 'ObjectId',
    pedido_id: 'ObjectId (reference to orders)',
    item_cardapio_id: 'ObjectId (reference to menu_items)',
    nome_item_cardapio: 'string',
    quantidade: 'number',
    preco_unitario: 'number',
    preco_total: 'number',
    instrucoes_especiais: 'string',
    created_at: 'Date'
  },
  
  order_status_history: {
    _id: 'ObjectId',
    pedido_id: 'ObjectId (reference to orders)',
    status: 'string',
    observacoes: 'string',
    criado_por: 'ObjectId (reference to users)',
    created_at: 'Date'
  },
  
  addresses: {
    _id: 'ObjectId',
    usuario_id: 'ObjectId (reference to users)',
    label: 'string',
    endereco: 'string',
    complemento: 'string',
    bairro: 'string',
    cidade: 'string',
    estado: 'string',
    cep: 'string',
    isdefault: 'boolean',
    created_at: 'Date'
  },
  
  drivers: {
    _id: 'ObjectId (matches user _id)',
    tipo_veiculo: 'string',
    placa: 'string',
    latitude_atual: 'number',
    longitude_atual: 'number',
    ultima_atualizacao_localizacao: 'Date',
    ativo: 'boolean',
    created_at: 'Date'
  },
  
  user_roles: {
    _id: 'ObjectId',
    userId: 'ObjectId (reference to users)',
    role: 'string',
    created_at: 'Date'
  },
  
  ratings: {
    _id: 'ObjectId',
    cliente_id: 'ObjectId (reference to users)',
    restaurante_id: 'ObjectId (reference to restaurants)',
    pedido_id: 'ObjectId (reference to orders)',
    nota: 'number',
    comentario: 'string',
    verificado: 'boolean',
    created_at: 'Date',
    updated_at: 'Date'
  },
  
  videos: {
    _id: 'ObjectId',
    restaurante_id: 'ObjectId (reference to restaurants)',
    item_cardapio_id: 'ObjectId (reference to menu_items)',
    titulo: 'string',
    descricao: 'string',
    video_url: 'string',
    thumbnail_url: 'string',
    views: 'number',
    likes: 'number',
    comentarios: 'number',
    ativo: 'boolean',
    created_at: 'Date'
  },
  
  video_likes: {
    _id: 'ObjectId',
    video_id: 'ObjectId (reference to videos)',
    usuario_id: 'ObjectId (reference to users)',
    created_at: 'Date'
  },
  
  video_comments: {
    _id: 'ObjectId',
    video_id: 'ObjectId (reference to videos)',
    usuario_id: 'ObjectId (reference to users)',
    conteudo: 'string',
    likes: 'number',
    created_at: 'Date'
  },
  
  saved_videos: {
    _id: 'ObjectId',
    video_id: 'ObjectId (reference to videos)',
    usuario_id: 'ObjectId (reference to users)',
    created_at: 'Date'
  },
  
  coupons: {
    _id: 'ObjectId',
    codigo: 'string',
    restaurante_id: 'ObjectId (reference to restaurants)',
    tipo: 'string (percentual, valor_fixo)',
    valor: 'number',
    valor_pedido_minimo: 'number',
    valor_desconto_maximo: 'number',
    data_inicio: 'Date',
    data_fim: 'Date',
    ativo: 'boolean',
    limite_uso: 'number',
    uso_atual: 'number',
    descricao: 'string',
    created_at: 'Date',
    updated_at: 'Date'
  },
  
  notifications: {
    _id: 'ObjectId',
    usuario_id: 'ObjectId (reference to users)',
    titulo: 'string',
    mensagem: 'string',
    tipo: 'string',
    id_relacionado: 'ObjectId',
    lida: 'boolean',
    created_at: 'Date'
  }
};
