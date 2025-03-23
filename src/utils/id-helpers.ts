
/**
 * Constantes para IDs de teste
 */
export const TEST_UUIDS = {
  RESTAURANT_1: '00000000-0000-0000-0000-000000000001',
  RESTAURANT_2: '00000000-0000-0000-0000-000000000002',
  RESTAURANT_3: '00000000-0000-0000-0000-000000000003',
  RESTAURANT_4: '00000000-0000-0000-0000-000000000004',
  RESTAURANT_5: '00000000-0000-0000-0000-000000000005',
  USER_1: '00000000-0000-0000-0000-000000001001',
  USER_2: '00000000-0000-0000-0000-000000001002',
  USER_3: '00000000-0000-0000-0000-000000001003',
  USER_4: '00000000-0000-0000-0000-000000001004',
  USER_5: '00000000-0000-0000-0000-000000001005',
};

/**
 * Verifica se uma string é um UUID válido
 * Também valida formatos especiais para testes
 */
export const isValidUUID = (id: string): boolean => {
  // Verify null or undefined
  if (!id) return false;
  
  // Verifica se é um dos nossos UUIDs de teste especiais
  if (id.startsWith('00000000-0000-0000-0000-')) {
    // Valida UUIDs de teste de restaurantes que terminam com um número (1-5)
    if (/^00000000-0000-0000-0000-0000000000[1-5]$/.test(id)) {
      return true;
    }
    
    // Valida UUIDs de teste de usuários
    if (/^00000000-0000-0000-0000-00000000100[1-5]$/.test(id)) {
      return true;
    }
  }
  
  // Verifica se é um UUID v4 padrão
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

/**
 * Converte um ID de parâmetro para um formato UUID válido
 * Útil para quando recebemos IDs de URLs ou parâmetros
 */
export const getIdFromParams = (id: string | undefined): string | null => {
  if (!id) return null;
  
  // Se for um número de 1 a 5, converte para UUID de teste
  if (/^[1-5]$/.test(id)) {
    return `00000000-0000-0000-0000-00000000000${id}`;
  }
  
  // Se já for um UUID válido, retorna ele mesmo
  if (isValidUUID(id)) {
    return id;
  }
  
  return null;
};
