
import React, { useEffect, useState } from 'react';
import { connectToDatabase, getConnectionStatus } from '@/integrations/mongodb/client';
import { toast } from 'sonner';
import { AlertCircle, Server, RefreshCw, Link2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

const MongoDBConnectionChecker: React.FC = () => {
  const [isChecking, setIsChecking] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [connectionError, setConnectionError] = useState<Error | null>(null);
  const [diagnostics, setDiagnostics] = useState<Record<string, any>>({});
  const MAX_RETRIES = 3;

  const handleRetry = () => {
    setRetryCount(0);
    setConnectionError(null);
    setIsChecking(true);
  };

  useEffect(() => {
    async function checkConnection() {
      try {
        setIsChecking(true);
        
        // Try to connect to MongoDB Atlas
        await connectToDatabase();
        
        // If we got here, connection was successful
        console.log('MongoDB Atlas connection successful!');
        toast.success('MongoDB Atlas connection established successfully!');
        setConnectionError(null);
      } catch (error) {
        console.error('Failed to connect to MongoDB Atlas:', error);
        setConnectionError(error as Error);
        
        // Get diagnostics from connection status
        const status = getConnectionStatus();
        setDiagnostics(status.diagnostics || {});
        
        if (retryCount < MAX_RETRIES) {
          // Try again after delay
          setRetryCount(prev => prev + 1);
          const delayTime = 2000 * (retryCount + 1); // Increase wait time with each attempt
          
          console.log(`Attempting to reconnect to MongoDB Atlas in ${delayTime/1000} seconds...`);
          setTimeout(() => checkConnection(), delayTime);
        } else {
          // Show error alert with diagnostics if all retries failed
          console.error('Connection diagnostics:', status.diagnostics);
          toast.error('Failed to connect to MongoDB Atlas. Check connection settings.');
        }
      } finally {
        setIsChecking(false);
      }
    }

    checkConnection();
  }, [retryCount]);

  // Only render something if there's a connection error after all retries
  if (connectionError && retryCount >= MAX_RETRIES) {
    const isDnsError = connectionError.message.includes('ENOTFOUND') || 
                      connectionError.message.includes('querySrv');
    
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro de Conexão com MongoDB Atlas</AlertTitle>
        <AlertDescription>
          <div className="text-sm space-y-2">
            <p className="font-medium">{isDnsError ? 'Erro de resolução DNS:' : 'Erro de conexão:'}</p>
            <p>{connectionError.message}</p>
            
            {/* Informações de diagnóstico específicas */}
            {isDnsError && (
              <div className="bg-red-50 border border-red-200 rounded p-2 mt-2">
                <p className="text-red-700 font-medium">Problema de DNS detectado</p>
                <p className="text-sm text-red-600 mt-1">
                  O servidor não conseguiu resolver o endereço do MongoDB Atlas. Isso geralmente ocorre quando:
                </p>
                <ul className="list-disc pl-5 text-sm text-red-600 mt-1">
                  <li>A string de conexão está incorreta (verifique o formato)</li>
                  <li>Existe um problema de rede impedindo consultas DNS</li>
                  <li>A conexão SRV está bloqueada pelo ambiente de hospedagem</li>
                </ul>
              </div>
            )}
            
            {diagnostics.connectionStringFormat && !diagnostics.connectionStringFormat.valid && (
              <p className="mt-1">Formato de string de conexão inválido. Verifique seu MONGODB_URI.</p>
            )}
            
            {diagnostics.renderDeploymentNote && (
              <div className="bg-blue-50 border border-blue-200 rounded p-2 mt-2">
                <p className="text-blue-700 font-medium">Aplicativo hospedado no Render</p>
                <p className="text-sm text-blue-600 mt-1">
                  O aplicativo está hospedado no Render. Verifique se a variável de ambiente MONGODB_URI 
                  está configurada corretamente nas configurações do serviço.
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  Algumas hospedagens têm restrições de rede que podem bloquear conexões MongoDB+SRV.
                  Tente usar uma string de conexão direta (mongodb://) em vez de SRV (mongodb+srv://).
                </p>
              </div>
            )}
            
            <div className="mt-3">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleRetry}
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" /> Tentar novamente
              </Button>
            </div>
            
            <p className="mt-4 text-xs opacity-70">
              Por favor, verifique sua conexão de rede e configuração do MongoDB Atlas.
              Você pode precisar adicionar o IP da sua hospedagem à lista de permissões no MongoDB Atlas.
            </p>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Exibe indicador de carregamento durante verificações
  if (isChecking) {
    return (
      <Alert variant="default" className="mt-4 bg-blue-50 border-blue-200">
        <Server className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-700">Verificando conexão com MongoDB</AlertTitle>
        <AlertDescription className="text-blue-600">
          <div className="flex items-center">
            <div className="animate-spin mr-2 h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            <span>
              Tentativa {retryCount + 1} de {MAX_RETRIES + 1}...
            </span>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return null; // This is just a utility component, doesn't render anything by default
};

export default MongoDBConnectionChecker;
