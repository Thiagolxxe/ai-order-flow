
/**
 * Mock implementation of file storage functionality that was previously using Supabase
 */

interface UploadOptions {
  upsert?: boolean;
  onProgress?: (progress: number) => void;
}

interface StorageResponse<T> {
  data: T | null;
  error: Error | null;
}

// Mock implementation of file storage
export const mongoStorage = {
  // Upload file
  async uploadFile(bucket: string, path: string, file: File, options?: UploadOptions): Promise<StorageResponse<{ path: string }>> {
    try {
      console.log(`Uploading file to ${bucket}/${path}`);
      
      // Simulate upload progress
      if (options?.onProgress) {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          options.onProgress?.(progress);
          if (progress >= 100) {
            clearInterval(interval);
          }
        }, 300);
      }
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real implementation, this would upload to MongoDB GridFS or another storage service
      
      return {
        data: { path },
        error: null
      };
    } catch (error: any) {
      console.error('Error uploading file:', error);
      return {
        data: null,
        error
      };
    }
  },
  
  // Get URL for file
  getFileUrl(bucket: string, path: string): string {
    // In a real implementation, this would generate a URL for the file in MongoDB GridFS
    // For now, just return a mock URL
    return `https://example.com/storage/${bucket}/${path}`;
  },
  
  // Delete file
  async deleteFile(bucket: string, path: string): Promise<StorageResponse<void>> {
    try {
      console.log(`Deleting file from ${bucket}/${path}`);
      
      // In a real implementation, this would delete the file from MongoDB GridFS
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        data: null,
        error: null
      };
    } catch (error: any) {
      console.error('Error deleting file:', error);
      return {
        data: null,
        error
      };
    }
  }
};

export default mongoStorage;
