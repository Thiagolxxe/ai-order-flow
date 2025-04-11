
/**
 * Network and CORS diagnostic utilities
 */

/**
 * Run a CORS diagnostic test
 */
export const runCORSDiagnostic = async (url: string, baseUrl: string): Promise<void> => {
  console.log('🔍 Executando diagnóstico de CORS...');
  
  try {
    // Try a simple HEAD request to check basic connectivity
    const response = await fetch(`${baseUrl}/api/cors-test`, {
      method: 'HEAD',
      mode: 'no-cors' // Use no-cors mode to at least see if the server is responding
    });
    
    console.log('✅ Servidor respondeu a requisição no-cors: ', response.type);
    
    console.log('Diagnóstico CORS:');
    console.log(`- URL da API: ${baseUrl}`);
    console.log(`- Origem atual: ${window.location.origin}`);
    console.log(`- Protocolo: ${window.location.protocol}`);
    console.log('- Sugestão: Verifique se o servidor está configurado para aceitar requisições CORS dessa origem');
  } catch (err) {
    console.error('❌ Falha no diagnóstico de CORS:', err);
  }
};

/**
 * Detect the type of connection error
 */
export const detectConnectionErrorType = (err: any): { 
  isCORSError: boolean; 
  isTimeout: boolean;
  errorCode: string;
  errorMessage: string;
} => {
  const isCORSError = 
    err.message?.includes('NetworkError') || 
    err.message?.includes('Failed to fetch') ||
    err.message?.includes('Network request failed') ||
    err.message?.includes('CORS');
  
  const isTimeout = err.name === 'AbortError';
  
  const errorCode = isTimeout 
    ? 'TIMEOUT' 
    : isCORSError 
      ? 'CORS_ERROR' 
      : 'CONNECTION_ERROR';
      
  const errorMessage = isTimeout
    ? 'A requisição excedeu o tempo limite'
    : isCORSError
      ? `Erro de CORS: Falha no acesso cross-origin. Verifique se o servidor permite solicitações de ${window.location.origin}`
      : err.message || 'Falha de conexão com o servidor';
      
  return {
    isCORSError,
    isTimeout,
    errorCode,
    errorMessage
  };
};
