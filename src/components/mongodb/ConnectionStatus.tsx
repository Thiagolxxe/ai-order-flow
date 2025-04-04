
import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, RotateCw } from 'lucide-react';
import { getConnectionStatus, isConnected } from '@/integrations/mongodb/client';

/**
 * Component that shows the MongoDB connection status
 */
const MongoDBConnectionStatus: React.FC = () => {
  const [status, setStatus] = useState({
    connected: false,
    checking: false,
    error: null as Error | null
  });

  // Check connection status on mount and every 30 seconds
  useEffect(() => {
    const checkConnection = () => {
      const connectionStatus = getConnectionStatus();
      setStatus({
        connected: isConnected(),
        checking: connectionStatus.status === 'connecting',
        error: connectionStatus.error
      });
    };

    // Check immediately
    checkConnection();
    
    // Set up interval for periodic checks
    const interval = setInterval(checkConnection, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Don't render anything in production
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  if (!status.connected && !status.checking && status.error) {
    return (
      <div className="fixed bottom-4 left-4 bg-destructive text-destructive-foreground px-3 py-2 rounded-md shadow-md flex items-center text-sm">
        <AlertCircle className="h-4 w-4 mr-2" />
        MongoDB: Desconectado
        <button
          className="ml-2 p-1 hover:bg-destructive-foreground/10 rounded"
          onClick={() => window.location.reload()}
          title="Reconectar"
        >
          <RotateCw className="h-3 w-3" />
        </button>
      </div>
    );
  }

  if (status.checking) {
    return (
      <div className="fixed bottom-4 left-4 bg-yellow-500 text-white px-3 py-2 rounded-md shadow-md flex items-center text-sm">
        <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
        Conectando ao MongoDB...
      </div>
    );
  }

  if (status.connected) {
    return (
      <div className="fixed bottom-4 left-4 bg-green-500 text-white px-3 py-2 rounded-md shadow-md flex items-center text-sm">
        <CheckCircle className="h-4 w-4 mr-2" />
        MongoDB: Conectado
      </div>
    );
  }

  return null;
};

export default MongoDBConnectionStatus;
