
/**
 * Utilitários para trabalhar com MongoDB no frontend
 */
import { ObjectId } from '@/integrations/mongodb/client';

/**
 * Verifica se uma string é um ObjectId válido
 */
export function isValidObjectId(id: string): boolean {
  return ObjectId.isValid(id);
}

/**
 * Gera um novo ObjectId
 */
export function generateObjectId(): string {
  return new ObjectId().toString();
}

/**
 * Converte datas ISO para objetos Date
 */
export function convertISODates(obj: any): any {
  if (!obj) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => convertISODates(item));
  }
  
  if (typeof obj === 'object') {
    const result: any = {};
    
    for (const key in obj) {
      const value = obj[key];
      
      // Verificar se é uma string que representa uma data ISO
      if (typeof value === 'string' && 
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/.test(value)) {
        result[key] = new Date(value);
      } else if (typeof value === 'object') {
        result[key] = convertISODates(value);
      } else {
        result[key] = value;
      }
    }
    
    return result;
  }
  
  return obj;
}

/**
 * Formata um ObjectId para um formato legível
 */
export function formatObjectId(id?: string): string {
  if (!id) return 'ID não disponível';
  
  if (isValidObjectId(id)) {
    // Retornar os últimos 8 caracteres para um formato mais curto
    return `#${id.slice(-8)}`;
  }
  
  return id;
}

/**
 * Normaliza dados do MongoDB para formato utilizável na UI
 */
export function normalizeMongoData<T>(data: any): T {
  if (!data) return data;
  
  // Se for um array, normaliza cada item
  if (Array.isArray(data)) {
    return data.map(item => normalizeMongoData(item)) as any;
  }
  
  // Se for um objeto
  if (typeof obj === 'object') {
    const result: any = { ...data };
    
    // Renomear _id para id se existir
    if (result._id !== undefined) {
      result.id = result._id.toString();
      delete result._id;
    }
    
    // Converter datas ISO
    return convertISODates(result);
  }
  
  return data as T;
}

/**
 * Helper function to handle MongoDB array results
 */
export function handleMongoArrayResponse<T>(response: any): T[] {
  if (!response) return [];
  
  // If response has toArray method, use it
  if (typeof response.toArray === 'function') {
    return normalizeMongoData<T[]>(response.toArray());
  }
  
  // If response has data property
  if (response.data) {
    return normalizeMongoData<T[]>(response.data);
  }
  
  // If response is already an array
  if (Array.isArray(response)) {
    return normalizeMongoData<T[]>(response);
  }
  
  return [];
}
