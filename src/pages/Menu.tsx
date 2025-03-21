
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SearchIcon, PlusIcon, MinusIcon } from 'lucide-react';
import MenuItemCard from '@/components/food/MenuItemCard';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Restaurant {
  id: string;
  nome: string;
}

interface Category {
  id: string;
  nome: string;
  descricao?: string;
  restaurante_id: string;
  ordem_exibicao: number;
}

interface MenuItem {
  id: string;
  nome: string;
  descricao?: string;
  preco: number;
  imagem_url?: string;
  categoria_id: string;
  restaurante_id: string;
  disponivel: boolean;
  destaque: boolean;
  category?: string;
  popular?: boolean;
  vegetarian?: boolean;
  spicy?: boolean;
}

interface CartItem {
  id: string;
  quantity: number;
}

const Menu = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();
  
  // Buscar dados do restaurante, categorias e itens do cardápio
  useEffect(() => {
    const fetchRestaurantData = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Buscar detalhes do restaurante
        const { data: restaurantData, error: restaurantError } = await supabase
          .from('restaurantes')
          .select('id, nome')
          .eq('id', id)
          .single();
        
        if (restaurantError) throw restaurantError;
        
        // Buscar categorias do cardápio
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categorias')
          .select('*')
          .eq('restaurante_id', id)
          .order('ordem_exibicao', { ascending: true });
        
        if (categoriesError) throw categoriesError;
        
        // Buscar itens do cardápio
        const { data: menuItemsData, error: menuItemsError } = await supabase
          .from('itens_cardapio')
          .select(`
            *,
            categorias (nome)
          `)
          .eq('restaurante_id', id)
          .eq('disponivel', true);
        
        if (menuItemsError) throw menuItemsError;
        
        // Formatar os dados dos itens do cardápio
        const formattedMenuItems = menuItemsData.map((item: any) => ({
          ...item,
          category: item.categoria_id,
          categoryName: item.categorias?.nome || 'Sem categoria',
          // Exemplos de atributos fictícios (em um sistema real, estes estariam no banco de dados)
          popular: item.destaque,
          vegetarian: false,
          spicy: false,
          image: item.imagem_url || `https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=500&auto=format&fit=crop`
        }));
        
        setRestaurant(restaurantData);
        setCategories(categoriesData);
        setMenuItems(formattedMenuItems);
        
        // Se houver categorias, definir a primeira como ativa
        if (categoriesData.length > 0) {
          setActiveCategory(categoriesData[0].id);
        }
        
        // Verificar se há itens no carrinho no localStorage
        const savedCart = localStorage.getItem(`cart_${id}`);
        if (savedCart) {
          setCartItems(JSON.parse(savedCart));
        }
      } catch (error) {
        console.error('Erro ao buscar dados do restaurante:', error);
        toast.error('Não foi possível carregar o cardápio');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRestaurantData();
  }, [id]);
  
  // Filtrar itens do menu com base na categoria e pesquisa
  const filteredItems = menuItems.filter(item =>
    (activeCategory === 'all' || item.categoria_id === activeCategory) &&
    (item.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
     (item.descricao && item.descricao.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  // Adicionar item ao carrinho
  const addToCart = (itemId: string) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === itemId);
      
      let newItems;
      if (existingItem) {
        newItems = prevItems.map(item => 
          item.id === itemId ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        newItems = [...prevItems, { id: itemId, quantity: 1 }];
      }
      
      // Armazenar no localStorage
      localStorage.setItem(`cart_${id}`, JSON.stringify(newItems));
      return newItems;
    });
    
    const item = menuItems.find(item => item.id === itemId);
    if (item) {
      toast.success(`${item.nome} adicionado ao carrinho`);
    }
  };

  // Remover item do carrinho
  const removeFromCart = (itemId: string) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === itemId);
      
      let newItems;
      if (existingItem && existingItem.quantity > 1) {
        newItems = prevItems.map(item => 
          item.id === itemId ? { ...item, quantity: item.quantity - 1 } : item
        );
      } else {
        newItems = prevItems.filter(item => item.id !== itemId);
      }
      
      // Armazenar no localStorage
      localStorage.setItem(`cart_${id}`, JSON.stringify(newItems));
      return newItems;
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
      return total + (item ? item.preco * cartItem.quantity : 0);
    }, 0);
  };

  // Total de itens no carrinho
  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  // Ir para a página do carrinho
  const viewCart = () => {
    // Salvar estado do carrinho no localStorage
    localStorage.setItem('currentRestaurant', id || '');
    localStorage.setItem(`cart_${id}`, JSON.stringify(cartItems));
    
    // Navegar para o carrinho
    navigate('/carrinho');
  };

  if (loading) {
    return (
      <div className="container px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="h-6 bg-muted animate-pulse rounded w-1/4"></div>
          <div className="h-10 bg-muted animate-pulse rounded w-1/3"></div>
        </div>
        <div className="h-12 bg-muted animate-pulse rounded mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((_, index) => (
            <div key={index} className="h-40 bg-muted animate-pulse rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-4 pb-20">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">{restaurant?.nome}</h1>
        
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
        value={activeCategory}
        onValueChange={setActiveCategory}
        className="mb-6"
      >
        <TabsList className="w-full overflow-x-auto flex gap-1 justify-start px-1 py-1 h-auto bg-secondary/80">
          <TabsTrigger value="all" className="px-3 py-1.5 text-sm">
            Todos
          </TabsTrigger>
          {categories.map(category => (
            <TabsTrigger 
              key={category.id} 
              value={category.id}
              className="px-3 py-1.5 text-sm whitespace-nowrap"
            >
              {category.nome}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {/* Itens do menu filtrados por categoria */}
        <TabsContent value={activeCategory} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map(item => (
              <MenuItemCard 
                key={item.id}
                item={{
                  id: item.id,
                  name: item.nome,
                  description: item.descricao || '',
                  price: item.preco,
                  image: item.imagem_url || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=500&auto=format&fit=crop',
                  category: item.categoryName,
                  popular: item.destaque,
                  vegetarian: item.vegetarian || false,
                  spicy: item.spicy || false
                }}
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
            <Button onClick={viewCart} size="lg">
              Ver Carrinho
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;
