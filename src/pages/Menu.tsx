
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SearchIcon, PlusIcon, MinusIcon } from 'lucide-react';
import MenuItemCard from '@/components/food/MenuItemCard';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';

// Dados fictícios do restaurante (em um app real, viria de uma API)
const mockRestaurant = {
  id: '1',
  name: 'Urban Burger Bistro',
  categories: [
    { id: 'burgers', name: 'Hambúrgueres' },
    { id: 'sides', name: 'Acompanhamentos' },
    { id: 'drinks', name: 'Bebidas' },
    { id: 'desserts', name: 'Sobremesas' }
  ]
};

// Dados fictícios dos itens do menu
const mockMenuItems = [
  {
    id: '1',
    name: 'Classic Burger',
    description: 'Hambúrguer artesanal, queijo cheddar, alface, tomate e molho especial',
    price: 26.90,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=500&auto=format&fit=crop',
    category: 'burgers',
    popular: true,
    vegetarian: false,
    spicy: false
  },
  {
    id: '2',
    name: 'Cheeseburger Bacon',
    description: 'Hambúrguer artesanal, queijo cheddar, bacon crocante, cebola caramelizada e molho barbecue',
    price: 32.90,
    image: 'https://images.unsplash.com/photo-1594728553171-e93fe616108a?q=80&w=500&auto=format&fit=crop',
    category: 'burgers',
    popular: true,
    vegetarian: false,
    spicy: false
  },
  {
    id: '3',
    name: 'Vegetarian Burger',
    description: 'Hambúrguer de grão-de-bico, queijo, rúcula, tomate seco e maionese de ervas',
    price: 29.90,
    image: 'https://images.unsplash.com/photo-1585238342024-78d387f4a707?q=80&w=500&auto=format&fit=crop',
    category: 'burgers',
    popular: false,
    vegetarian: true,
    spicy: false
  },
  {
    id: '4',
    name: 'Spicy Burger',
    description: 'Hambúrguer artesanal, queijo pepper jack, pimenta jalapeño, cebola roxa e molho picante',
    price: 34.90,
    image: 'https://images.unsplash.com/photo-1551782450-17144efb9c50?q=80&w=500&auto=format&fit=crop',
    category: 'burgers',
    popular: true,
    vegetarian: false,
    spicy: true
  },
  {
    id: '5',
    name: 'Batata Frita',
    description: 'Porção de batatas fritas crocantes',
    price: 14.90,
    image: 'https://images.unsplash.com/photo-1630384060421-cb20321727cb?q=80&w=500&auto=format&fit=crop',
    category: 'sides',
    popular: true,
    vegetarian: true,
    spicy: false
  },
  {
    id: '6',
    name: 'Onion Rings',
    description: 'Anéis de cebola empanados e fritos',
    price: 18.90,
    image: 'https://images.unsplash.com/photo-1639024471283-03518883512d?q=80&w=500&auto=format&fit=crop',
    category: 'sides',
    popular: false,
    vegetarian: true,
    spicy: false
  },
  {
    id: '7',
    name: 'Refrigerante',
    description: 'Lata 350ml (Coca-Cola, Guaraná, Sprite)',
    price: 6.90,
    image: 'https://images.unsplash.com/photo-1581098365948-6a5a912b7a49?q=80&w=500&auto=format&fit=crop',
    category: 'drinks',
    popular: false,
    vegetarian: true,
    spicy: false
  },
  {
    id: '8',
    name: 'Milk Shake',
    description: 'Milk shake cremoso nos sabores chocolate, morango ou baunilha (400ml)',
    price: 16.90,
    image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?q=80&w=500&auto=format&fit=crop',
    category: 'drinks',
    popular: true,
    vegetarian: true,
    spicy: false
  },
  {
    id: '9',
    name: 'Brownie',
    description: 'Brownie de chocolate com sorvete de baunilha',
    price: 18.90,
    image: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?q=80&w=500&auto=format&fit=crop',
    category: 'desserts',
    popular: true,
    vegetarian: true,
    spicy: false
  }
];

const Menu = () => {
  const { id } = useParams<{ id: string }>();
  const [restaurant, setRestaurant] = useState(mockRestaurant);
  const [menuItems, setMenuItems] = useState(mockMenuItems);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('burgers');
  const [cartItems, setCartItems] = useState<{ id: string, quantity: number }[]>([]);
  const isMobile = useIsMobile();
  
  // Filtrar itens do menu com base na categoria e pesquisa
  const filteredItems = menuItems.filter(item =>
    (activeCategory === 'all' || item.category === activeCategory) &&
    (item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Adicionar item ao carrinho
  const addToCart = (itemId: string) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === itemId);
      
      if (existingItem) {
        return prevItems.map(item => 
          item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevItems, { id: itemId, quantity: 1 }];
      }
    });
    
    const item = menuItems.find(item => item.id === itemId);
    if (item) {
      toast.success(`${item.name} adicionado ao carrinho`);
    }
  };

  // Remover item do carrinho
  const removeFromCart = (itemId: string) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === itemId);
      
      if (existingItem && existingItem.quantity > 1) {
        return prevItems.map(item => 
          item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item
        );
      } else {
        return prevItems.filter(item => item.id !== itemId);
      }
    });
  };

  // Obter a quantidade de um item no carrinho
  const getItemQuantity = (itemId: string) => {
    const item = cartItems.find(item => item.id === itemId);
    return item ? item.quantity : 0;
  };

  // Calcular o total do carrinho
  const getTotalPrice = () => {
    return cartItems.reduce((total, cartItem) => {
      const item = menuItems.find(menuItem => menuItem.id === cartItem.id);
      return total + (item ? item.price * cartItem.quantity : 0);
    }, 0);
  };

  // Total de itens no carrinho
  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <div className="container px-4 py-4 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">{restaurant.name}</h1>
        
        {/* Barra de pesquisa */}
        <div className="relative max-w-xs w-full">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            type="text"
            placeholder="Buscar no cardápio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-secondary"
          />
        </div>
      </div>
      
      {/* Categorias */}
      <Tabs
        defaultValue="burgers"
        value={activeCategory}
        onValueChange={setActiveCategory}
        className="mb-6"
      >
        <TabsList className="w-full overflow-x-auto flex gap-1 justify-start px-1 py-1 h-auto bg-secondary/80">
          <TabsTrigger value="all" className="px-3 py-1.5 text-sm">
            Todos
          </TabsTrigger>
          {restaurant.categories.map(category => (
            <TabsTrigger 
              key={category.id} 
              value={category.id}
              className="px-3 py-1.5 text-sm whitespace-nowrap"
            >
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {/* Itens do menu filtrados por categoria */}
        <TabsContent value={activeCategory} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map(item => (
              <MenuItemCard 
                key={item.id}
                item={item}
                quantity={getItemQuantity(item.id)}
                onAdd={() => addToCart(item.id)}
                onRemove={() => removeFromCart(item.id)}
              />
            ))}
          </div>
          
          {filteredItems.length === 0 && (
            <div className="text-center py-12 bg-secondary/50 rounded-lg">
              <SearchIcon className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <h3 className="text-lg font-medium">Nenhum item encontrado</h3>
              <p className="text-muted-foreground">Tente ajustar sua busca ou selecione outra categoria</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* Carrinho fixo na parte inferior (visível apenas se houver itens) */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t p-4 shadow-elevation-3">
          <div className="container flex justify-between items-center">
            <div>
              <div className="font-medium">{getTotalItems()} {getTotalItems() === 1 ? 'item' : 'itens'}</div>
              <div className="text-xl font-semibold">R$ {getTotalPrice().toFixed(2).replace('.', ',')}</div>
            </div>
            <Button asChild size="lg">
              <a href="/carrinho">Ver Carrinho</a>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;
