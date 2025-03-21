
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ArrowLeftIcon, TrashIcon, MinusIcon, PlusIcon, PercentIcon, ShoppingBagIcon } from 'lucide-react';
import { toast } from 'sonner';
import CartItemCard from '@/components/food/CartItemCard';
import { useIsMobile } from '@/hooks/use-mobile';

// Dados de exemplo do carrinho (em um app real, isso viria do estado global ou localStorage)
const initialCartItems = [
  {
    id: '1',
    name: 'Classic Burger',
    price: 26.90,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=500&auto=format&fit=crop',
    quantity: 2
  },
  {
    id: '5',
    name: 'Batata Frita',
    price: 14.90,
    image: 'https://images.unsplash.com/photo-1630384060421-cb20321727cb?q=80&w=500&auto=format&fit=crop',
    quantity: 1
  },
  {
    id: '8',
    name: 'Milk Shake',
    price: 16.90,
    image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?q=80&w=500&auto=format&fit=crop',
    quantity: 1
  }
];

const Cart = () => {
  const [cartItems, setCartItems] = useState(initialCartItems);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Aumentar quantidade
  const increaseQuantity = (itemId: string) => {
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };
  
  // Diminuir quantidade
  const decreaseQuantity = (itemId: string) => {
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
      )
    );
  };
  
  // Remover item
  const removeItem = (itemId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
    toast.success('Item removido do carrinho');
  };
  
  // Aplicar cupom
  const applyCoupon = () => {
    if (couponCode.toLowerCase() === 'desc10') {
      setDiscount(10);
      toast.success('Cupom aplicado: 10% de desconto');
    } else if (couponCode.toLowerCase() === 'desc20') {
      setDiscount(20);
      toast.success('Cupom aplicado: 20% de desconto');
    } else {
      toast.error('Cupom inválido');
    }
  };
  
  // Calcular subtotal
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  // Calcular valor do desconto
  const discountValue = (subtotal * discount) / 100;
  
  // Calcular taxa de entrega
  const deliveryFee = subtotal > 0 ? 6.90 : 0;
  
  // Calcular total
  const total = subtotal - discountValue + deliveryFee;
  
  // Verificar se o carrinho está vazio
  const isCartEmpty = cartItems.length === 0;
  
  // Ir para checkout
  const goToCheckout = () => {
    if (isCartEmpty) {
      toast.error('Adicione itens ao carrinho para continuar');
    } else {
      navigate('/finalizar');
    }
  };

  return (
    <div className="container px-4 py-6 pb-20">
      {/* Cabeçalho */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/">
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-semibold">Meu Carrinho</h1>
      </div>
      
      {isCartEmpty ? (
        /* Carrinho vazio */
        <div className="text-center py-16 bg-secondary/50 rounded-lg">
          <ShoppingBagIcon className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-medium mb-2">Seu carrinho está vazio</h3>
          <p className="text-muted-foreground mb-8">Adicione itens ao seu carrinho para continuar</p>
          <Button asChild>
            <Link to="/">Explorar Restaurantes</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Lista de itens */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <h2 className="font-medium mb-4 text-lg">Itens do Pedido</h2>
                
                <div className="space-y-4">
                  {cartItems.map(item => (
                    <CartItemCard
                      key={item.id}
                      item={item}
                      onIncrease={() => increaseQuantity(item.id)}
                      onDecrease={() => decreaseQuantity(item.id)}
                      onRemove={() => removeItem(item.id)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Resumo do pedido */}
          <div>
            <Card>
              <CardContent className="p-6">
                <h2 className="font-medium mb-4 text-lg">Resumo do Pedido</h2>
                
                {/* Cupom de desconto */}
                <div className="flex gap-2 mb-6">
                  <Input
                    placeholder="Cupom de desconto"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <Button 
                    variant="outline" 
                    onClick={applyCoupon}
                    disabled={!couponCode}
                  >
                    <PercentIcon className="h-4 w-4 mr-2" />
                    Aplicar
                  </Button>
                </div>
                
                {/* Detalhes do preço */}
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-foreground/70">Subtotal</span>
                    <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Desconto ({discount}%)</span>
                      <span>- R$ {discountValue.toFixed(2).replace('.', ',')}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-foreground/70">Taxa de Entrega</span>
                    <span>R$ {deliveryFee.toFixed(2).replace('.', ',')}</span>
                  </div>
                  
                  <Separator className="my-3" />
                  
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>R$ {total.toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>
                
                {/* Botão de finalizar pedido */}
                <Button 
                  className="w-full mt-6" 
                  size="lg"
                  onClick={goToCheckout}
                >
                  Finalizar Pedido
                </Button>
                
                <Button 
                  variant="link" 
                  className="w-full mt-2" 
                  asChild
                >
                  <Link to="/">Adicionar mais itens</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
