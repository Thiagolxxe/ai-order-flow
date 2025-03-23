
import { supabase } from '@/integrations/supabase/client';
import { FunctionResponse, OrderContext } from './types';

/**
 * Handle function calls by executing the appropriate function
 */
export const handleFunctionCall = async (functionCall: FunctionResponse, context?: OrderContext): Promise<string> => {
  if (!functionCall) return '';
  
  try {
    switch (functionCall.name) {
      case 'buscar_restaurantes':
        return await buscarRestaurantes(
          functionCall.arguments.culinaria, 
          functionCall.arguments.localizacao, 
          functionCall.arguments.preco
        );
      
      case 'verificar_status_pedido':
        return await verificarStatusPedido(functionCall.arguments.numero_pedido);
      
      case 'obter_previsao_tempo':
        return await obterPrevisaoTempo(
          functionCall.arguments.cidade || (context?.userLocation?.cidade || '')
        );
      
      default:
        return `Função não implementada: ${functionCall.name}`;
    }
  } catch (error) {
    console.error(`Error executing function ${functionCall.name}:`, error);
    return `Erro ao executar a função ${functionCall.name}. Por favor, tente novamente.`;
  }
};

/**
 * Implementation of function to search restaurants
 */
export const buscarRestaurantes = async (
  culinaria: string, 
  localizacao?: string, 
  preco?: string
): Promise<string> => {
  try {
    // Query restaurants from Supabase based on parameters
    let query = supabase
      .from('restaurantes')
      .select('*');
    
    if (culinaria) {
      query = query.ilike('tipo_cozinha', `%${culinaria}%`);
    }
    
    if (localizacao) {
      query = query.ilike('bairro', `%${localizacao}%`);
    }
    
    if (preco) {
      let faixaPreco = '';
      switch (preco) {
        case 'barato': faixaPreco = '$'; break;
        case 'médio': faixaPreco = '$$'; break;
        case 'caro': faixaPreco = '$$$'; break;
      }
      
      if (faixaPreco) {
        query = query.eq('faixa_preco', faixaPreco);
      }
    }
    
    const { data, error } = await query.limit(5);
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return `Não encontrei restaurantes com esses critérios. Tente outras opções.`;
    }
    
    return `Encontrei ${data.length} restaurantes:\n` + 
      data.map(r => `- ${r.nome}: ${r.tipo_cozinha} (${r.faixa_preco})`).join('\n');
    
  } catch (error) {
    console.error('Error in buscarRestaurantes:', error);
    return 'Erro ao buscar restaurantes. Por favor, tente novamente.';
  }
};

/**
 * Implementation of function to check order status
 */
export const verificarStatusPedido = async (numeroPedido: string): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        id,
        numero_pedido,
        status,
        restaurante_id,
        restaurantes (nome),
        entregador_id,
        criado_em,
        tempo_estimado
      `)
      .eq('numero_pedido', numeroPedido)
      .maybeSingle();
    
    if (error) throw error;
    
    if (!data) {
      return `Não encontrei nenhum pedido com o número ${numeroPedido}.`;
    }
    
    // Format the status in Portuguese
    let statusPt = 'Desconhecido';
    switch (data.status) {
      case 'pending': statusPt = 'Pendente'; break;
      case 'preparing': statusPt = 'Em preparação'; break;
      case 'ready': statusPt = 'Pronto para entrega'; break;
      case 'delivering': statusPt = 'Em entrega'; break;
      case 'delivered': statusPt = 'Entregue'; break;
      case 'cancelled': statusPt = 'Cancelado'; break;
    }
    
    const restauranteName = data.restaurantes?.nome || 'Restaurante';
    const tempoEstimado = data.tempo_estimado ? String(data.tempo_estimado) : 'Não informado';
    
    return `Pedido #${data.numero_pedido} do ${restauranteName}:\n` +
      `Status: ${statusPt}\n` +
      `Feito em: ${new Date(data.criado_em).toLocaleString('pt-BR')}\n` +
      `Tempo estimado: ${tempoEstimado} minutos`;
    
  } catch (error) {
    console.error('Error in verificarStatusPedido:', error);
    return 'Erro ao verificar o status do pedido. Por favor, tente novamente.';
  }
};

/**
 * Implementation of function to get weather forecast
 */
export const obterPrevisaoTempo = async (cidade?: string): Promise<string> => {
  try {
    if (!cidade) {
      return 'Não foi possível identificar sua localização. Por favor, informe a cidade para obter a previsão do tempo.';
    }

    // Normalmente, faríamos uma chamada a uma API real de previsão do tempo aqui
    // Para fins de demonstração, vamos simular uma resposta
    const previsoes = [
      'ensolarado', 'parcialmente nublado', 'nublado', 
      'chuvoso', 'tempestade', 'neve', 'ventoso'
    ];
    const temperaturas = [
      {min: 15, max: 25},
      {min: 18, max: 28},
      {min: 10, max: 20},
      {min: 8, max: 15},
      {min: 20, max: 32}
    ];
    
    // Seleciona uma previsão aleatória para simular
    const previsao = previsoes[Math.floor(Math.random() * previsoes.length)];
    const temperatura = temperaturas[Math.floor(Math.random() * temperaturas.length)];
    
    return `Previsão do tempo para ${cidade}:\n` +
      `Clima: ${previsao}\n` +
      `Temperatura: ${temperatura.min}°C a ${temperatura.max}°C\n` +
      `Umidade: ${Math.floor(Math.random() * 50) + 30}%\n` +
      `Atualizado em: ${new Date().toLocaleString('pt-BR')}`;
    
  } catch (error) {
    console.error('Error in obterPrevisaoTempo:', error);
    return 'Erro ao obter a previsão do tempo. Por favor, tente novamente.';
  }
};
