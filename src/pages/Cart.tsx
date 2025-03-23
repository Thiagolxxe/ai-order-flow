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
import { supabase } from '@/integrations/supabase/client';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

interface Restaurant {
  id: string;
  nome: string;
  taxa_entrega: number;
}

const Cart = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Carregar dados do carrinho do localStorage
  useEffect(() => {
    const loadCartData = async () => {
      try {
        setLoading(true);
        
        // Obter o ID do restaurante atual
        const restaurantId = localStorage.getItem('currentRestaurant');
        if (!restaurantId) {
          setCartItems([]);
          setLoading(false);
          return;
        }
        
        // Validar se o ID do restaurante é válido
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        
        // Handle numeric IDs (1-5) by converting them to UUIDs
        let validRestaurantId = restaurantId;
        if (/^\d+$/.test(restaurantId)) {
          const numericId = parseInt(restaurantId);
          if (numericId > 0 && numericId <= 5) {
            validRestaurantId = `00000000-0000-0000-0000-00000000000${numericId}`;
            console.log(`Converting numeric ID ${restaurantId} to test UUID: ${validRestaurantId}`);
          }
        }
        
        if (!uuidRegex.test(validRestaurantId)) {
          console.error('ID do restaurante inválido:', validRestaurantId);
          setCartItems([]);
          setLoading(false);
          return;
        }
        
        // Obter os itens do carrinho usando o ID validado
        const savedCart = localStorage.getItem(`cart_${validRestaurantId}`);
        if (!savedCart) {
          setCartItems([]);
          setLoading(false);
          return;
        }
        
        const parsedCart = JSON.parse(savedCart);
        if (!parsedCart || !parsedCart.items || parsedCart.items.length === 0) {
          setCartItems([]);
          setLoading(false);
          return;
        }
        
        // Ensure we're using the valid restaurant ID for all operations
        localStorage.setItem('currentRestaurant', validRestaurantId);
        
        // Buscar detalhes do restaurante
        const { data: restaurantData, error: restaurantError } = await supabase
          .from('restaurantes')
          .select('id, nome, taxa_entrega')
          .eq('id', validRestaurantId)
          .maybeSingle();
        
        if (restaurantError) {
          console.error('Erro ao buscar dados do restaurante:', restaurantError);
          toast.error('Não foi possível carregar os dados do restaurante');
          setLoading(false);
          return;
        }
        
        setRestaurant(restaurantData || {
          id: validRestaurantId,
          nome: 'Restaurante',
          taxa_entrega: parsedCart.deliveryFee || 0
        });
        setCartItems(parsedCart.items || []);
        setDiscount(parsedCart.discount || 0);
        
      } catch (error) {
        console.error('Erro ao carregar dados do carrinho:', error);
        toast.error('Não foi possível carregar os dados do carrinho');
      } finally {
        setLoading(false);
      }
    };
    
    loadCartData();
  }, []);
  
  // Aumentar quantidade
  const increaseQuantity = (itemId: string) => {
    setCartItems(prevItems => {
      const updatedItems = prevItems.map(item => 
        item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
      );
      
      // Atualizar localStorage
      if (restaurant) {
        const simplifiedItems = updatedItems.map(({ id, quantity }) => ({ id, quantity }));
        localStorage.setItem(`cart_${restaurant.id}`, JSON.stringify(simplifiedItems));
      }
      
      return updatedItems;
    });
  };
  
  // Diminuir quantidade
  const decreaseQuantity = (itemId: string) => {
    setCartItems(prevItems => {
      const updatedItems = prevItems.map(item => 
        item.id === itemId && item.quantity > 1 ? { ...item, quantity: item.quantity - 1 } : item
      );
      
      // Atualizar localStorage
      if (restaurant) {
        const simplifiedItems = updatedItems.map(({ id, quantity }) => ({ id, quantity }));
        localStorage.setItem(`cart_${restaurant.id}`, JSON.stringify(simplifiedItems));
      }
      
      return updatedItems;
    });
  };
  
  // Remover item
  const removeItem = (itemId: string) => {
    setCartItems(prevItems => {
      const updatedItems = prevItems.filter(item => item.id !== itemId);
      
      // Atualizar localStorage
      if (restaurant) {
        const simplifiedItems = updatedItems.map(({ id, quantity }) => ({ id, quantity }));
        localStorage.setItem(`cart_${restaurant.id}`, JSON.stringify(simplifiedItems));
      }
      
      return updatedItems;
    });
    toast.success('Item removido do carrinho');
  };
  
  // Aplicar cupom
  const applyCoupon = async () => {
    if (!couponCode) return;
    
    try {
      // Verificar se o cupom existe e é válido
      const { data: promoData, error: promoError } = await supabase
        .from('promocoes')
        .select('*')
        .eq('codigo', couponCode.toUpperCase())
        .eq('ativo', true)
        .lte('data_inicio', new Date().toISOString())
        .gte('data_fim', new Date().toISOString())
        .maybeSingle();
      
      if (promoError) throw promoError;
      
      if (!promoData) {
        toast.error('Cupom inválido ou expirado');
        return;
      }
      
      // Verificar se o cupom é para o restaurante atual
      if (promoData.restaurante_id && promoData.restaurante_id !== restaurant?.id) {
        toast.error('Este cupom não é válido para este restaurante');
        return;
      }
      
      // Verificar se o valor mínimo do pedido é suficiente
      if (promoData.valor_pedido_minimo > 0 && promoData.valor_pedido_minimo > subtotal) {
        toast.error(`Valor mínimo para este cupom: R$${promoData.valor_pedido_minimo.toFixed(2).replace('.', ',')}`);
        return;
      }
      
      // Aplicar desconto
      if (promoData.tipo === 'percentual') {
        setDiscount(promoData.valor);
        toast.success(`Cupom aplicado: ${promoData.valor}% de desconto`);
      } else {
        // Para descontos de valor fixo, calculamos o equivalente em percentual para simplificar
        const percentDiscount = (promoData.valor / subtotal) * 100;
        setDiscount(percentDiscount);
        toast.success(`Cupom aplicado: R$${promoData.valor.toFixed(2).replace('.', ',')} de desconto`);
      }
    } catch (error) {
      console.error('Erro ao aplicar cupom:', error);
      toast.error('Não foi possível aplicar o cupom');
    }
  };
  
  // Calcular subtotal
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  
  // Calcular valor do desconto
  const discountValue = (subtotal * discount) / 100;
  
  // Calcular taxa de entrega
  const deliveryFee = restaurant ? restaurant.taxa_entrega : 0;
  
  // Calcular total
  const total = subtotal - discountValue + deliveryFee;
  
  // Verificar se o carrinho está vazio
  const isCartEmpty = cartItems.length === 0;
  
  // Ir para checkout
  const goToCheckout = () => {
    if (isCartEmpty) {
      toast.error('Adicione itens ao carrinho para continuar');
    } else {
      // Salvar dados do pedido para o checkout
      const checkoutData = {
        restaurantId: restaurant?.id,
        items: cartItems,
        subtotal,
        discount,
        discountValue,
        deliveryFee,
        total
      };
      
      localStorage.setItem('checkout_data', JSON.stringify(checkoutData));
      
      if (restaurant) {
        localStorage.setItem(`cart_${restaurant.id}`, JSON.stringify(checkoutData));
      }
      
      navigate('/finalizar');
    }
  };

  if (loading) {
    return (
      <div className="container px-4 py-8">
        <div className="h-8 bg-muted animate-pulse rounded mb-6 w-1/3"></div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="h-40 bg-muted animate-pulse rounded mb-4"></div>
            <div className="h-40 bg-muted animate-pulse rounded"></div>
          </div>
          <div>
            <div className="h-60 bg-muted animate-pulse rounded"></div>
          </div>
        </div>
      </div>
    );
  }

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
                <h2 className="font-medium mb-4 text-lg">{restaurant?.nome} - Itens do Pedido</h2>
                
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
                  <Link to={`/restaurante/${restaurant?.id}/menu`}>Adicionar mais itens</Link>
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
