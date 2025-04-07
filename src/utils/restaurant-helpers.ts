
import { RestaurantDetailsData } from '@/hooks/useRestaurantDetails';

/**
 * Generates mock restaurant data for testing
 */
export function generateMockRestaurantData(): RestaurantDetailsData[] {
  return [
    {
      id: '1',
      nome: 'Pizza Express',
      tipo_cozinha: 'Italiana',
      descricao: 'As melhores pizzas da cidade',
      endereco: 'Av. Paulista, 1000',
      cidade: 'São Paulo',
      estado: 'SP',
      avaliacao: 4.5,
      imagem_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591',
      // Compatibility with old interface - removed `telefone` as it's not in the type
      banner_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591',
      contato: {
        telefone: '(11) 99999-9999'
      }
    },
    {
      id: '2',
      nome: 'Burger King',
      tipo_cozinha: 'Hambúrguer',
      descricao: 'Hambúrgueres artesanais',
      endereco: 'Rua Augusta, 500',
      cidade: 'São Paulo',
      estado: 'SP',
      avaliacao: 4.2,
      imagem_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
      banner_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
      contato: {
        telefone: '(11) 99999-8888'
      }
    },
    {
      id: '3',
      nome: 'Sushi Palace',
      tipo_cozinha: 'Japonesa',
      descricao: 'O melhor da culinária japonesa',
      endereco: 'Alameda Santos, 800',
      cidade: 'São Paulo',
      estado: 'SP',
      avaliacao: 4.7,
      imagem_url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c',
      banner_url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c',
      contato: {
        telefone: '(11) 99999-7777'
      }
    },
    {
      id: '4',
      nome: 'Taco Bell',
      tipo_cozinha: 'Mexicana',
      descricao: 'Comida mexicana autêntica',
      endereco: 'Rua Oscar Freire, 300',
      cidade: 'São Paulo',
      estado: 'SP',
      avaliacao: 4.1,
      imagem_url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47',
      banner_url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47',
      contato: {
        telefone: '(11) 99999-6666'
      }
    },
    {
      id: '5',
      nome: 'China in Box',
      tipo_cozinha: 'Chinesa',
      descricao: 'Comida chinesa delivery',
      endereco: 'Av. Rebouças, 1200',
      cidade: 'São Paulo',
      estado: 'SP',
      avaliacao: 3.9,
      imagem_url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d',
      banner_url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d',
      contato: {
        telefone: '(11) 99999-5555'
      }
    }
  ];
}

/**
 * Get a fake restaurant by ID
 */
export function getMockRestaurantById(id: string): RestaurantDetailsData | undefined {
  const allRestaurants = generateMockRestaurantData();
  return allRestaurants.find(r => r.id === id);
}
