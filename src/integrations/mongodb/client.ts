
// MongoDB client integration

export interface MongoResponse<T> {
  data: T | null;
  error?: {
    message: string;
    code?: number;
  };
}

export async function connectToDatabase() {
  // This function would normally connect to a MongoDB instance
  // For now, we'll implement a mock version that simulates MongoDB behavior
  
  return {
    db: {
      collection: (collectionName: string) => {
        return {
          find: async (query: any = {}) => {
            console.log(`MongoDB: Finding documents in ${collectionName} with query:`, query);
            // Mock implementation that returns an array of items
            const mockData = getMockData(collectionName, query);
            
            // Custom implementation with toArray method
            const result: Promise<MongoResponse<any[]>> = Promise.resolve({
              data: mockData
            });
            
            // Add toArray method to the Promise
            Object.defineProperty(result, 'toArray', {
              value: () => Promise.resolve(mockData),
              enumerable: false,
              configurable: true
            });
            
            return result;
          },
          findOne: async (query: any = {}) => {
            console.log(`MongoDB: Finding one document in ${collectionName} with query:`, query);
            // Mock implementation that returns a single item
            const mockData = getMockData(collectionName, query);
            return {
              data: mockData && mockData.length > 0 ? mockData[0] : null
            };
          },
          insertOne: async (document: any) => {
            console.log(`MongoDB: Inserting document into ${collectionName}:`, document);
            // Mock successful insert
            return {
              data: { 
                insertedId: crypto.randomUUID(),
                ...document
              }
            };
          },
          updateOne: async (query: any, update: any) => {
            console.log(`MongoDB: Updating document in ${collectionName} with query:`, query);
            console.log(`MongoDB: Update operation:`, update);
            // Mock successful update
            return {
              data: { 
                matchedCount: 1,
                modifiedCount: 1,
                ...update.$set
              }
            };
          },
          deleteOne: async (query: any) => {
            console.log(`MongoDB: Deleting document from ${collectionName} with query:`, query);
            // Mock successful delete
            return {
              data: { 
                deletedCount: 1
              }
            };
          }
        };
      }
    }
  };
}

// Helper function to generate mock data based on collection name
function getMockData(collectionName: string, query: any): any[] {
  switch (collectionName) {
    case 'restaurants':
      return [
        {
          _id: '1',
          nome: 'Restaurante Italiano',
          descricao: 'O melhor da culinária italiana',
          tipo_cozinha: 'Italiana',
          endereco: 'Rua da Itália, 123',
          cidade: 'São Paulo',
          estado: 'SP',
          proprietario_id: query.proprietario_id || 'user123',
          banner_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop'
        }
      ];
    case 'orders':
      return [
        {
          _id: '1',
          numero_pedido: 'ORD12345',
          status: 'preparando',
          cliente_id: query.cliente_id || 'user123',
          restaurante_id: '1',
          endereco_entrega: 'Rua dos Clientes, 456, São Paulo, SP',
          total: 75.90
        }
      ];
    case 'videos':
      return [
        {
          _id: '1',
          titulo: 'Preparando nossa pizza especial',
          descricao: 'Veja como preparamos nossa pizza mais pedida',
          video_url: 'https://example.com/video1.mp4',
          thumbnail_url: 'https://example.com/thumbnail1.jpg',
          restaurante_id: query.restaurante_id || '1',
          views: 120,
          likes: 45
        }
      ];
    case 'users':
    case 'profiles':
      return [
        {
          _id: '1',
          id: query.id || 'user123',
          nome: 'João Silva',
          email: 'joao@exemplo.com',
          telefone: '(11) 98765-4321'
        }
      ];
    case 'funcoes_usuario':
      return [
        {
          _id: '1',
          usuario_id: query.usuario_id || 'user123',
          role_name: 'cliente'
        }
      ];
    default:
      return [];
  }
}
