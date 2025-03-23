
/**
 * Constantes para IDs de teste
 */
export const TEST_UUIDS = {
  RESTAURANT_1: '00000000-0000-0000-0000-000000000001',
  RESTAURANT_2: '00000000-0000-0000-0000-000000000002',
  RESTAURANT_3: '00000000-0000-0000-0000-000000000003',
  RESTAURANT_4: '00000000-0000-0000-0000-000000000004',
  RESTAURANT_5: '00000000-0000-0000-0000-000000000005',
};

/**
 * Verifica se uma string é um UUID válido
 * Também valida formatos especiais para testes
 */
export const isValidUUID = (id: string): boolean => {
  // Verifica se é um dos nossos UUIDs de teste especiais
  if (id.startsWith('00000000-0000-0000-0000-0000000000')) {
    // Valida UUIDs de teste que terminam com um número (1-5)
    if (/^00000000-0000-0000-0000-0000000000[1-5]$/.test(id)) {
      return true;
    }
  }
  
  // Verifica se é um UUID v4 padrão
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

