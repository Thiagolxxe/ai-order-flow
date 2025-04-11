
import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, RotateCw, Database } from 'lucide-react';
import { getConnectionStatus, isConnected, connectToDatabase } from '@/integrations/mongodb/client';
import { toast } from 'sonner';

/**
 * Component that shows the MongoDB Atlas connection status
 */
const MongoDBConnectionStatus: React.FC = () => {
  const [status, setStatus] = useState({
    connected: false,
    checking: false,
    error: null as Error | null,
    lastAttempt: null as Date | null,
    retryCount: 0
  });

  const handleReconnect = async () => {
    try {
      setStatus(prev => ({ ...prev, checking: true }));
      await connectToDatabase();
      toast.success('Successfully reconnected to MongoDB Atlas!');
    } catch (error) {
      toast.error('Failed to reconnect to MongoDB Atlas');
      console.error('Error reconnecting:', error);
    }
  };

  // Check connection status on mount and every 15 seconds
  useEffect(() => {
    const checkConnection = () => {
      const connectionStatus = getConnectionStatus();
      setStatus({
        connected: isConnected(),
        checking: connectionStatus.status === 'connecting',
        error: connectionStatus.error,
        lastAttempt: connectionStatus.lastAttempt,
        retryCount: connectionStatus.retryCount
      });
    };

    // Check immediately
    checkConnection();
    
    // Set up interval for periodic checks
    const interval = setInterval(checkConnection, 15000);
    
    return () => clearInterval(interval);
  }, []);

  if (!status.connected && !status.checking && status.error) {
    return (
      <div className="fixed bottom-4 left-4 bg-destructive text-destructive-foreground px-3 py-2 rounded-md shadow-md flex items-center text-sm">
        <AlertCircle className="h-4 w-4 mr-2" />
        <span>
          MongoDB Atlas: Disconnected
          {status.lastAttempt && (
            <span className="ml-1 opacity-70 text-xs">
              ({new Date(status.lastAttempt).toLocaleTimeString()})
            </span>
          )}
        </span>
        <button
          className="ml-2 p-1 hover:bg-destructive-foreground/10 rounded"
          onClick={handleReconnect}
          title="Reconnect"
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
        Connecting to MongoDB Atlas...
        {status.retryCount > 0 && (
          <span className="ml-1 text-xs">
            (Attempt {status.retryCount})
          </span>
        )}
      </div>
    );
  }

  if (status.connected) {
    return (
      <div className="fixed bottom-4 left-4 bg-green-500 text-white px-3 py-2 rounded-md shadow-md flex items-center text-sm">
        <Database className="h-4 w-4 mr-2" />
        MongoDB Atlas: Connected
      </div>
    );
  }

  return null;
};

export default MongoDBConnectionStatus;
