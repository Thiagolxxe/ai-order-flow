
import React, { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const API_URL = 'http://localhost:5000/api';

const MongoDBConnectionStatus = () => {
  const [connectionError, setConnectionError] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch(`${API_URL}/check-connection`);
        const data = await response.json();
        
        if (!response.ok || !data.success) {
          throw new Error(data.error || 'Falha na conexão com o MongoDB');
        }
        
        setConnectionError(false);
      } catch (error) {
        console.error('MongoDB connection error:', error);
        setConnectionError(true);
      } finally {
        setChecking(false);
      }
    };

    checkConnection();
  }, []);

  if (checking || !connectionError) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md">
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Problema de conexão</AlertTitle>
        <AlertDescription>
          Não foi possível conectar ao MongoDB. Verifique se o servidor backend está rodando e se as credenciais do MongoDB estão corretas.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default MongoDBConnectionStatus;
