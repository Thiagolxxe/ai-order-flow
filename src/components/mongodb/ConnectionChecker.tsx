
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
        console.log('MongoDB Atlas connection successful!');
        toast.success('MongoDB Atlas connection established successfully!');
      } catch (error) {
        console.error('Failed to connect to MongoDB Atlas:', error);
        
        if (retryCount < MAX_RETRIES) {
          // Try again after delay
          setRetryCount(prev => prev + 1);
          const delayTime = 2000 * (retryCount + 1); // Increase wait time with each attempt
          
          console.log(`Attempting to reconnect to MongoDB Atlas in ${delayTime/1000} seconds...`);
          setTimeout(() => checkConnection(), delayTime);
        } else {
          toast.error('Failed to connect to MongoDB Atlas. Check your connection settings and try again.');
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
