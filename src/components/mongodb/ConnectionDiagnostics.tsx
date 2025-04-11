
import React from 'react';
import { Database, ExternalLink } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { API_BASE_URL } from '@/config/apiConfig';

interface ConnectionDiagnosticsProps {
  mongoStatus: 'idle' | 'connecting' | 'connected' | 'error';
  apiStatus: 'idle' | 'checking' | 'connected' | 'error';
}

export const ConnectionDiagnostics: React.FC<ConnectionDiagnosticsProps> = ({
  mongoStatus,
  apiStatus
}) => {
  // Only show diagnostics when there's something to diagnose
  const showMongoSuccessApiError = mongoStatus === 'connected' && apiStatus === 'error';
  const showBothFailed = mongoStatus === 'error' && apiStatus === 'error';
  
  if (!showMongoSuccessApiError && !showBothFailed) return null;

  return (
    <>
      {/* MongoDB connected but API failed */}
      {showMongoSuccessApiError && (
        <Alert variant="default" className="bg-blue-50 border-blue-200">
          <Database className="h-4 w-4 text-blue-600 mr-2" />
          <AlertTitle className="text-blue-700">Diagnóstico do problema</AlertTitle>
          <AlertDescription className="text-blue-600">
            <p className="mb-2">A conexão com MongoDB Atlas foi bem-sucedida, mas o servidor API no Render não está disponível.</p>
            <p className="text-sm mb-2">
              O erro <strong>"Cannot connect to the server"</strong> na tela de login ocorre porque a aplicação está tentando
              autenticar através do servidor API no Render ({API_BASE_URL}), mas este servidor não está respondendo.
            </p>
            <div className="bg-white/50 border border-blue-100 rounded p-2 text-sm mt-2">
              <p className="font-medium">Soluções possíveis:</p>
              <ol className="list-decimal pl-5 mt-1">
                <li>Verifique se o serviço no Render está ativo e funcionando</li>
                <li>Configure a variável de ambiente <code>VITE_API_URL</code> com a URL correta do seu backend</li>
                <li>Utilize o modo de demonstração com dados simulados (já configurado como fallback)</li>
              </ol>
            </div>
            <div className="mt-3 flex justify-end">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-blue-600 border-blue-300 hover:bg-blue-100"
                onClick={() => window.location.href = '/login'}
              >
                <ExternalLink className="h-3 w-3 mr-2" />
                Voltar ao login
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Both MongoDB and API failed */}
      {showBothFailed && (
        <Alert variant="default" className="bg-blue-50 border-blue-200">
          <Database className="h-4 w-4 text-blue-600 mr-2" />
          <AlertTitle className="text-blue-700">Informações de depuração</AlertTitle>
          <AlertDescription className="text-blue-600">
            <p className="mb-2">O aplicativo está enfrentando problemas de conexão com o MongoDB Atlas e com o servidor da API no Render.</p>
            <p className="text-sm">
              Para autenticação, o aplicativo usará o modo de demonstração. As operações de banco de dados
              serão simuladas localmente. O aplicativo funcionará, mas com funcionalidade limitada.
            </p>
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};
