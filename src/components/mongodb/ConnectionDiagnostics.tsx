
import React from 'react';
import { Database, ExternalLink, Globe, RefreshCw, Laptop, Shield, AlertCircle, User } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { API_BASE_URL } from '@/config/apiConfig';

interface ConnectionDiagnosticsProps {
  mongoStatus: 'idle' | 'connecting' | 'connected' | 'error';
  apiStatus: 'idle' | 'checking' | 'connected' | 'error';
  corsError?: boolean;
  authError?: boolean;
}

export const ConnectionDiagnostics: React.FC<ConnectionDiagnosticsProps> = ({
  mongoStatus,
  apiStatus,
  corsError = false,
  authError = false
}) => {
  // Only show diagnostics when there's something to diagnose
  const showMongoSuccessApiError = mongoStatus === 'connected' && apiStatus === 'error';
  const showBothFailed = mongoStatus === 'error' && apiStatus === 'error';
  const showAuthError = authError && mongoStatus === 'connected';
  
  if (!showMongoSuccessApiError && !showBothFailed && !showAuthError) return null;

  // Esta função testa se um domínio está acessível
  const testDomainConnection = async () => {
    try {
      // Apenas tentamos acessar a URL raiz para ver se o domínio está respondendo
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), 5000);
      
      console.log('Testando conexão no modo no-cors para:', API_BASE_URL);
      const response = await fetch(API_BASE_URL, { 
        method: 'HEAD',
        signal: controller.signal,
        mode: 'no-cors' // Use no-cors para pelo menos verificar se o servidor responde
      });
      
      clearTimeout(id);
      console.log('Resposta do teste no-cors:', response);
      
      // No modo no-cors, não conseguimos acessar a propriedade .ok
      // Mas se chegamos aqui, alguma resposta foi recebida
      alert(`Servidor em ${API_BASE_URL} está respondendo no modo no-cors. O problema pode ser especificamente um erro de configuração CORS.`);
    } catch (error) {
      console.error('Erro ao testar domínio:', error);
      alert(`Não foi possível acessar o domínio ${API_BASE_URL}. O servidor parece estar offline.`);
    }
  };

  const checkRenderStatus = () => {
    window.open('https://status.render.com', '_blank');
  };

  return (
    <>
      {/* Authentication Error */}
      {showAuthError && (
        <Alert variant="default" className="bg-amber-50 border-amber-200 mb-4">
          <AlertCircle className="h-4 w-4 text-amber-600 mr-2" />
          <AlertTitle className="text-amber-700">Erro de Autenticação</AlertTitle>
          <AlertDescription className="text-amber-600">
            <p className="mb-2">O servidor rejeitou suas credenciais. Isso pode ocorrer pelos seguintes motivos:</p>
            <div className="bg-white/50 border border-amber-100 rounded p-2 text-sm mt-2">
              <p className="font-medium">Possíveis causas:</p>
              <ol className="list-decimal pl-5 mt-1">
                <li>Email ou senha incorretos</li>
                <li>Conta não registrada no sistema</li>
                <li>Conta desativada ou bloqueada</li>
                <li>Servidor funcionando em modo de demonstração</li>
              </ol>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-amber-600 border-amber-300 hover:bg-amber-100"
                onClick={() => window.location.href = '/register'}
              >
                <User className="h-3 w-3 mr-2" />
                Criar conta
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="text-amber-600 border-amber-300 hover:bg-amber-100"
                onClick={() => window.location.reload()}
              >
                <RefreshCw className="h-3 w-3 mr-2" />
                Tentar novamente
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

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
            
            {corsError && (
              <div className="bg-amber-50/50 border border-amber-100 rounded p-2 text-sm mt-2 mb-2">
                <p className="font-medium flex items-center"><Shield className="h-3.5 w-3.5 mr-1" /> Erro de CORS detectado!</p>
                <p className="mt-1">O servidor está bloqueando requisições do seu navegador devido a políticas de segurança cross-origin.</p>
                <p className="mt-1">Veja o painel "Erro de CORS Detectado" abaixo para informações detalhadas sobre como resolver.</p>
              </div>
            )}
            
            <div className="bg-white/50 border border-blue-100 rounded p-2 text-sm mt-2">
              <p className="font-medium">Soluções possíveis:</p>
              <ol className="list-decimal pl-5 mt-1">
                <li>Verifique se o serviço no Render está ativo e funcionando</li>
                <li>Configure a variável de ambiente <code>VITE_API_URL</code> com a URL correta do seu backend</li>
                <li>Utilize o modo de demonstração com dados simulados (já configurado como fallback)</li>
                {corsError && <li className="text-amber-700 font-medium">Configure o CORS no servidor para permitir requisições desta origem</li>}
              </ol>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-blue-600 border-blue-300 hover:bg-blue-100"
                onClick={() => window.open(`${API_BASE_URL}`, '_blank')}
              >
                <Globe className="h-3 w-3 mr-2" />
                Verificar servidor
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="text-blue-600 border-blue-300 hover:bg-blue-100"
                onClick={testDomainConnection}
              >
                <Laptop className="h-3 w-3 mr-2" />
                Testar conexão
              </Button>
              
              {corsError && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-amber-600 border-amber-300 hover:bg-amber-100"
                  onClick={() => window.open('https://developer.mozilla.org/pt-BR/docs/Web/HTTP/CORS', '_blank')}
                >
                  <Shield className="h-3 w-3 mr-2" />
                  Sobre CORS
                </Button>
              )}
              
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
            <p className="text-sm mb-2">
              Para autenticação, o aplicativo usará o modo de demonstração. As operações de banco de dados
              serão simuladas localmente. O aplicativo funcionará, mas com funcionalidade limitada.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="text-blue-600 border-blue-300 hover:bg-blue-100"
                onClick={() => window.open(`${API_BASE_URL}`, '_blank')}
              >
                <Globe className="h-3 w-3 mr-2" />
                Verificar servidor
              </Button>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="text-blue-600 border-blue-300 hover:bg-blue-100"
                onClick={checkRenderStatus}
              >
                <RefreshCw className="h-3 w-3 mr-2" />
                Status do Render
              </Button>
              
              {corsError && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-amber-600 border-amber-300 hover:bg-amber-100"
                  onClick={() => window.open('https://developer.mozilla.org/pt-BR/docs/Web/HTTP/CORS', '_blank')}
                >
                  <Shield className="h-3 w-3 mr-2" />
                  Sobre CORS
                </Button>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </>
  );
};
