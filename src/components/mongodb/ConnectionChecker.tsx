
import React, { useEffect, useState } from 'react';
import { connectToDatabase, getConnectionStatus } from '@/integrations/mongodb/client';
import { toast } from 'sonner';

const MongoDBConnectionChecker: React.FC = () => {
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    async function checkConnection() {
      try {
        setIsChecking(true);
        
        // Try to connect to MongoDB
        await connectToDatabase();
        
        // If we got here, connection was successful
        console.log('MongoDB connection successful!');
        toast.success('MongoDB connection established successfully!');
      } catch (error) {
        console.error('MongoDB connection failed:', error);
        toast.error('Failed to connect to MongoDB. Please check the console for details.');
      } finally {
        setIsChecking(false);
      }
    }

    checkConnection();
  }, []);

  return null; // This is just a utility component, doesn't render anything
};

export default MongoDBConnectionChecker;
