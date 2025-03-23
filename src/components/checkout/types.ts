
export interface CheckoutData {
  restaurantId: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  discountValue: number;
  deliveryFee: number;
  total: number;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface Address {
  id: string;
  label: string;
  street: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipcode: string;
}

export type PaymentMethod = 'credit' | 'money' | 'pix';
