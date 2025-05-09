
import React, { useEffect, useState } from 'react';
import { MongoDBStatusChecker } from '@/components/mongodb/MongoDBStatusChecker';
import { connectToDatabase } from '@/integrations/mongodb/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw, Database, Server } from 'lucide-react';
import RestaurantList from '@/components/restaurants/RestaurantList';
import HeroSection from '@/components/ui/HeroSection';
import { toast } from 'sonner';
import { httpClient } from '@/utils/httpClient';
import { API_BASE_URL, apiConfig } from '@/config/apiConfig';

export default function Index() {
  const [isTestingBackend, setIsTestingBackend] = useState(false);
  const [backendTestResult, setBackendTestResult] = useState<{
    success: boolean;
    message: string;
    details?: string;
  } | null>(null);

  const testBackendConnection = async () => {
    try {
      setIsTestingBackend(true);
      setBackendTestResult(null);
      
      // First, verify MongoDB connection
      await connectToDatabase();
      
      // Test database operations by fetching restaurants
      const { db } = await connectToDatabase();
      const collection = db.collection('restaurants');
      const result = await collection.find({}).toArray();
      
      console.log('Database test result:', result);
      
      // Try to connect to API on Render to verify full connectivity
      const apiUrl = `${API_BASE_URL}${apiConfig.endpoints.system.healthCheck}`;
      console.log(`Testando conexão com a API em: ${apiUrl}`);
      
      try {
        const { data, error, status } = await httpClient.get(apiConfig.endpoints.system.healthCheck);
        console.log('API test response:', { data, status });
        
        if (error) {
          setBackendTestResult({
            success: true,
            message: 'Conexão com o banco de dados bem-sucedida, mas API indisponível',
            details: `Operações de MongoDB Atlas testadas com sucesso. ${result && result.length ? `Restaurantes encontrados: ${result.length}` : 'Nenhum restaurante encontrado.'} A API no Render não está disponível, usando modo de demonstração.`
          });
        } else {
          setBackendTestResult({
            success: true,
            message: 'Conexão com o backend completa bem-sucedida',
            details: `Operações testadas: MongoDB Atlas, Busca de dados e conexão com API no Render. ${result && result.length ? `Restaurantes encontrados: ${result.length}` : 'Nenhum restaurante encontrado.'}`
          });
        }
      } catch (apiError) {
        console.error('API connection error:', apiError);
        setBackendTestResult({
          success: true,
          message: 'Conexão com o banco de dados bem-sucedida, mas API indisponível',
          details: `Operações de MongoDB Atlas testadas com sucesso. ${result && result.length ? `Restaurantes encontrados: ${result.length}` : 'Nenhum restaurante encontrado.'} A API no Render não está disponível, usando modo de demonstração.`
        });
      }
      
      toast.success('Teste de backend concluído com sucesso!');
    } catch (error) {
      console.error('Backend test error:', error);
      
      setBackendTestResult({
        success: false,
        message: 'Falha na conexão com o backend',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      
      toast.error('Falha no teste de backend');
    } finally {
      setIsTestingBackend(false);
    }
  };

  return (
    <div className="pb-16">
      <HeroSection />
      
      <div className="container py-8 space-y-8">
        <h2 className="text-2xl font-bold">Status da Aplicação</h2>
        
        <MongoDBStatusChecker />
        
        {/* Backend Connection Test */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Teste de Conexão com Backend</h3>
            <Button 
              onClick={testBackendConnection} 
              disabled={isTestingBackend}
              variant="outline"
              className="flex items-center gap-2"
            >
              {isTestingBackend ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Testando...</span>
                </>
              ) : (
                <>
                  <Server className="h-4 w-4" />
                  <span>Testar Conexão</span>
                </>
              )}
            </Button>
          </div>
          
          {backendTestResult && (
            <Alert variant={backendTestResult.success ? "default" : "destructive"}>
              <Database className="h-4 w-4 mr-2" />
              <AlertTitle>{backendTestResult.message}</AlertTitle>
              <AlertDescription>
                {backendTestResult.details}
              </AlertDescription>
            </Alert>
          )}
          
          <p className="text-muted-foreground mt-2 text-sm">
            Este teste verifica a conexão com o MongoDB Atlas, a operação de busca no banco de dados e a disponibilidade da API no Render.
          </p>
        </div>
        
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-6">Restaurantes em Destaque</h2>
          <RestaurantList maxItems={4} title="Restaurantes Populares" showSearch={false} />
        </div>
      </div>
    </div>
  );
}
