
import { Video } from './types';

// Mock video data with reliable sources 
export const MOCK_VIDEOS: Video[] = [
  {
    id: '1',
    restaurantId: '00000000-0000-0000-0000-000000000r01',
    restaurantName: 'Pizzaria Bella Napoli',
    dishName: 'Pizza Margherita',
    price: 49.90,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-top-view-of-a-homemade-margherita-pizza-on-a-table-40799-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
    likes: 1243,
    description: 'Nossa deliciosa pizza margherita tradicional, com molho de tomate caseiro, muçarela de búfala e manjericão fresco.',
  },
  {
    id: '2',
    restaurantId: '00000000-0000-0000-0000-000000000r02',
    restaurantName: 'Sabor Oriental',
    dishName: 'Combinado Especial',
    price: 89.90,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-serving-sushi-at-a-japanese-restaurant-9181-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
    likes: 856,
    description: 'Combinado especial com 16 peças variadas de sushi e sashimi, ideal para compartilhar.',
  },
  {
    id: '3',
    restaurantId: '00000000-0000-0000-0000-000000000r03',
    restaurantName: 'Hamburgeria Ground Zero',
    dishName: 'Burger Duplo',
    price: 39.90,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-top-view-of-preparing-a-hamburger-on-a-grill-35593-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
    likes: 2405,
    description: 'Hambúrguer duplo com cheddar derretido, bacon crocante e molho especial da casa.',
  },
  {
    id: '4',
    restaurantId: '00000000-0000-0000-0000-000000000r04',
    restaurantName: 'Cantina Toscana',
    dishName: 'Fettuccine Alfredo',
    price: 54.90,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-pasta-being-prepared-with-cheese-19151-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1574894709920-11b28e7367e3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
    likes: 1876,
    description: 'Massa fresca artesanal com molho cremoso de queijo parmesão e manteiga.',
  },
  {
    id: '5',
    restaurantId: '00000000-0000-0000-0000-000000000r05',
    restaurantName: 'Doceria Sweet Dreams',
    dishName: 'Bolo de Chocolate Trufado',
    price: 18.90,
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-cutting-a-chocolate-cake-on-a-plate-43132-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
    likes: 3201,
    description: 'Fatia generosa do nosso bolo de chocolate premium, com recheio de trufa e cobertura de ganache.',
  }
];
