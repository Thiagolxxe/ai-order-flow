
export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface Restaurant {
  id: string;
  nome: string;
  taxa_entrega: number;
}

export interface CartData {
  items: CartItem[];
  restaurantId: string;
  discount: number;
  deliveryFee: number;
}
