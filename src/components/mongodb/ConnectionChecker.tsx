
import React, { useEffect, useState } from 'react';
import { connectToDatabase, getConnectionStatus } from '@/integrations/mongodb/client';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const MongoDBConnectionChecker: React.FC = () => {
  const [isChecking, setIsChecking] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [connectionError, setConnectionError] = useState<Error | null>(null);
  const [diagnostics, setDiagnostics] = useState<Record<string, any>>({});
  const MAX_RETRIES = 3;

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
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="text-sm">
            <p className="font-medium">MongoDB Atlas Connection Error:</p>
            <p>{connectionError.message}</p>
            {diagnostics.connectionStringFormat && !diagnostics.connectionStringFormat.valid && (
              <p className="mt-1">Invalid connection string format. Please check your MONGODB_URI.</p>
            )}
            <p className="mt-2 text-xs opacity-70">
              Please check your network connection and MongoDB Atlas configuration.
            </p>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return null; // This is just a utility component, doesn't render anything by default
};

export default MongoDBConnectionChecker;
