
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
      telefone: '(11) 99999-9999',
      banner_url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591',
      faixa_preco: 2,
      // Compatibility with old interface
      name: 'Pizza Express',
      address: 'Av. Paulista, 1000, São Paulo - SP',
      cuisine: 'Italiana',
      rating: 2,
      imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591',
      deliveryPosition: { lat: -23.5629, lng: -46.6544 }
    },
    {
      id: '2',
      nome: 'Burger King',
      tipo_cozinha: 'Hambúrguer',
      descricao: 'Hambúrgueres artesanais',
      endereco: 'Rua Augusta, 500',
      cidade: 'São Paulo',
      estado: 'SP',
      telefone: '(11) 99999-8888',
      banner_url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
      faixa_preco: 1,
      // Compatibility with old interface
      name: 'Burger King',
      address: 'Rua Augusta, 500, São Paulo - SP',
      cuisine: 'Hambúrguer',
      rating: 1,
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
      deliveryPosition: { lat: -23.5530, lng: -46.6429 }
    },
    {
      id: '3',
      nome: 'Sushi Palace',
      tipo_cozinha: 'Japonesa',
      descricao: 'O melhor da culinária japonesa',
      endereco: 'Alameda Santos, 800',
      cidade: 'São Paulo',
      estado: 'SP',
      telefone: '(11) 99999-7777',
      banner_url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c',
      faixa_preco: 3,
      // Compatibility with old interface
      name: 'Sushi Palace',
      address: 'Alameda Santos, 800, São Paulo - SP',
      cuisine: 'Japonesa',
      rating: 3,
      imageUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c',
      deliveryPosition: { lat: -23.5682, lng: -46.6490 }
    },
    {
      id: '4',
      nome: 'Taco Bell',
      tipo_cozinha: 'Mexicana',
      descricao: 'Comida mexicana autêntica',
      endereco: 'Rua Oscar Freire, 300',
      cidade: 'São Paulo',
      estado: 'SP',
      telefone: '(11) 99999-6666',
      banner_url: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47',
      faixa_preco: 2,
      // Compatibility with old interface
      name: 'Taco Bell',
      address: 'Rua Oscar Freire, 300, São Paulo - SP',
      cuisine: 'Mexicana',
      rating: 2,
      imageUrl: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47',
      deliveryPosition: { lat: -23.5616, lng: -46.6709 }
    },
    {
      id: '5',
      nome: 'China in Box',
      tipo_cozinha: 'Chinesa',
      descricao: 'Comida chinesa delivery',
      endereco: 'Av. Rebouças, 1200',
      cidade: 'São Paulo',
      estado: 'SP',
      telefone: '(11) 99999-5555',
      banner_url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d',
      faixa_preco: 1,
      // Compatibility with old interface
      name: 'China in Box',
      address: 'Av. Rebouças, 1200, São Paulo - SP',
      cuisine: 'Chinesa',
      rating: 1,
      imageUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d',
      deliveryPosition: { lat: -23.5578, lng: -46.6641 }
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
