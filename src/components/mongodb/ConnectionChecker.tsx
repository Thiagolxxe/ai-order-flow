
import React, { useEffect, useState } from 'react';
import { connectToDatabase, getConnectionStatus } from '@/integrations/mongodb/client';
import { toast } from 'sonner';

const MongoDBConnectionChecker: React.FC = () => {
  const [isChecking, setIsChecking] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  useEffect(() => {
    async function checkConnection() {
      try {
        setIsChecking(true);
        
        // Try to connect to MongoDB Atlas
        await connectToDatabase();
        
        // If we got here, connection was successful
        console.log('Conexão com MongoDB Atlas bem-sucedida!');
        toast.success('Conexão com MongoDB Atlas estabelecida com sucesso!');
      } catch (error) {
        console.error('Falha na conexão com MongoDB Atlas:', error);
        
        if (retryCount < MAX_RETRIES) {
          // Try again after delay
          setRetryCount(prev => prev + 1);
          const delayTime = 2000 * (retryCount + 1); // Aumenta o tempo de espera a cada tentativa
          
          console.log(`Tentando reconectar ao MongoDB Atlas em ${delayTime/1000} segundos...`);
          setTimeout(() => checkConnection(), delayTime);
        } else {
          toast.error('Falha na conexão com MongoDB Atlas. Verifique as configurações de conexão e tente novamente.');
        }
      } finally {
        setIsChecking(false);
      }
    }

    checkConnection();
  }, [retryCount]);

  return null; // This is just a utility component, doesn't render anything
};

export default MongoDBConnectionChecker;
