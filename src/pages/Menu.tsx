import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RestaurantIcon, ShoppingCartIcon } from '@/assets/icons';
import { useToast } from "@/hooks/use-toast";
import { toast } from 'sonner';
import MenuItemCard from '@/components/food/MenuItemCard';
import { supabase } from '@/integrations/supabase/client';
import { getIdFromParams } from '@/utils/id-helpers';
import { Badge } from "@/components/ui/badge";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  restaurant_id: string;
  popular?: boolean;
  vegetarian?: boolean;
  spicy?: boolean;
}

const Menu = () => {
  const { id } = useParams<{ id: string }>();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [cartItems, setCartItems] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { toast: uiToast } = useToast();
  const [totalCartItems, setTotalCartItems] = useState<number>(0);

  // Calculate total cart items when cartItems changes
  useEffect(() => {
    const total = Object.values(cartItems).reduce((sum, quantity) => sum + quantity, 0);
    setTotalCartItems(total);
  }, [cartItems]);

  // Load cart items from localStorage on component mount
  useEffect(() => {
    if (!id) return;
    
    const savedCart = localStorage.getItem(`cart_${id}`);
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        const cartItemsObj: Record<string, number> = {};
        
        parsedCart.forEach((item: { id: string; quantity: number }) => {
          cartItemsObj[item.id] = item.quantity;
        });
        
        setCartItems(cartItemsObj);
      } catch (error) {
        console.error('Error parsing cart data:', error);
      }
    }
  }, [id]);

  useEffect(() => {
    const fetchMenu = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Use utility function to validate or convert the ID
        const validId = getIdFromParams(id);
        
        if (!validId) {
          console.error('Invalid restaurant ID format:', id);
          setError('ID de restaurante inválido');
          uiToast({
            title: "Erro ao carregar cardápio",
            description: "ID de restaurante inválido",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        // Try to fetch from Supabase first
        const { data: supabaseItems, error: supabaseError } = await supabase
          .from('itens_cardapio')
          .select('*')
          .eq('restaurante_id', validId);
        
        if (supabaseError) {
          console.error("Error fetching menu items from Supabase:", supabaseError);
          // Fall back to mock data
          useMockMenuItems(validId);
          return;
        }
        
        if (supabaseItems && supabaseItems.length > 0) {
          // Map Supabase data to our MenuItem interface
          const formattedItems: MenuItem[] = supabaseItems.map(item => ({
            id: item.id,
            name: item.nome,
            description: item.descricao || '',
            price: parseFloat(item.preco),
            category: item.categoria_id || 'Sem categoria',
            image_url: item.imagem_url || '',
            restaurant_id: item.restaurante_id,
            popular: item.destaque || false,
            vegetarian: false, // Add these properties if they exist in your database
            spicy: false
          }));
          
          setMenuItems(formattedItems);
          
          // Extract unique categories
          const uniqueCategories = ['Todos', ...new Set(formattedItems.map((item) => item.category))];
          setCategories(uniqueCategories);
        } else {
          // No items found in Supabase, use mock data
          console.log("No menu items found in Supabase, using mock data");
          useMockMenuItems(validId);
        }
      } catch (error) {
        console.error("Failed to fetch menu items", error);
        uiToast({
          title: "Erro ao carregar cardápio",
          description: "Não foi possível carregar os itens do cardápio.",
          variant: "destructive",
        });
        
        // Attempt to use mock data as fallback
        useMockMenuItems(id || '');
      } finally {
        setIsLoading(false);
      }
    };

    fetchMenu();
  }, [id, uiToast]);

  // Helper function to use mock data
  const useMockMenuItems = (restaurantId: string) => {
    console.log("Using mock menu data for restaurant:", restaurantId);
    
    const mockMenu = [
      {
        id: '1',
        name: 'Classic Burger',
        description: 'Delicious burger with lettuce, tomato, and cheese',
        price: 26.90,
        category: 'Hambúrgueres',
        image_url: '/burger.jpg',
        restaurant_id: restaurantId,
      },
      {
        id: '2',
        name: 'Margherita Pizza',
        description: 'Classic pizza with tomato sauce, mozzarella, and basil',
        price: 32.90,
        category: 'Pizzas',
        image_url: '/pizza.jpg',
        restaurant_id: restaurantId,
      },
      {
        id: '3',
        name: 'Caesar Salad',
        description: 'Fresh salad with romaine lettuce, croutons, and Caesar dressing',
        price: 14.90,
        category: 'Saladas',
        image_url: '/salad.jpg',
        restaurant_id: restaurantId,
      },
      {
        id: '4',
        name: 'Chocolate Cake',
        description: 'Rich chocolate cake with chocolate frosting',
        price: 16.90,
        category: 'Sobremesas',
        image_url: '/cake.jpg',
        restaurant_id: restaurantId,
      },
      {
        id: '5',
        name: 'Coca-Cola',
        description: 'Refreshing Coca-Cola',
        price: 8.90,
        category: 'Bebidas',
        image_url: '/coke.jpg',
        restaurant_id: restaurantId,
      },
      {
        id: '6',
        name: 'Cheeseburger Bacon',
        description: 'Delicious burger with lettuce, tomato, and cheese',
        price: 35.90,
        category: 'Hambúrgueres',
        image_url: '/burger.jpg',
        restaurant_id: restaurantId,
        popular: true,
        vegetarian: false,
        spicy: true,
      },
      {
        id: '7',
        name: 'Portuguesa Pizza',
        description: 'Classic pizza with tomato sauce, mozzarella, and basil',
        price: 42.90,
        category: 'Pizzas',
        image_url: '/pizza.jpg',
        restaurant_id: restaurantId,
        popular: false,
        vegetarian: false,
        spicy: false,
      },
      {
        id: '8',
        name: 'Salada Tropical',
        description: 'Fresh salad with romaine lettuce, croutons, and Caesar dressing',
        price: 24.90,
        category: 'Saladas',
        image_url: '/salad.jpg',
        restaurant_id: restaurantId,
        popular: false,
        vegetarian: true,
        spicy: false,
      },
      {
        id: '9',
        name: 'Mousse de Maracujá',
        description: 'Rich chocolate cake with chocolate frosting',
        price: 26.90,
        category: 'Sobremesas',
        image_url: '/cake.jpg',
        restaurant_id: restaurantId,
        popular: true,
        vegetarian: true,
        spicy: false,
      },
      {
        id: '10',
        name: 'Suco de Laranja',
        description: 'Refreshing Coca-Cola',
        price: 18.90,
        category: 'Bebidas',
        image_url: '/coke.jpg',
        restaurant_id: restaurantId,
        popular: false,
        vegetarian: true,
        spicy: false,
      },
    ];

    setMenuItems(mockMenu);

    // Extract unique categories
    const uniqueCategories = ['Todos', ...new Set(mockMenu.map((item) => item.category))];
    setCategories(uniqueCategories);
  };

  // Save current restaurant ID to localStorage for cart
  useEffect(() => {
    if (id) {
      localStorage.setItem('currentRestaurant', id);
    }
  }, [id]);

  // Filter menu items based on active category and search term
  const filteredMenuItems = menuItems.filter((item) => {
    const searchTermLower = searchTerm.toLowerCase();
    const itemNameLower = item.name.toLowerCase();
    const itemDescriptionLower = item.description.toLowerCase();
    
    const matchesCategory = activeCategory === 'Todos' || item.category === activeCategory;
    const matchesSearch = searchTerm === '' || 
                         itemNameLower.includes(searchTermLower) || 
                         itemDescriptionLower.includes(searchTermLower);
    
    return matchesCategory && matchesSearch;
  });

  // Handle adding items to cart
  const handleAddItem = (itemId: string) => {
    setCartItems(prevItems => {
      const updatedItems = {
        ...prevItems,
        [itemId]: (prevItems[itemId] || 0) + 1
      };
      
      // Save to localStorage
      if (id) {
        const cartData = Object.keys(updatedItems).map(id => ({
          id,
          quantity: updatedItems[id]
        }));
        localStorage.setItem(`cart_${id}`, JSON.stringify(cartData));
      }
      
      return updatedItems;
    });
    toast('Item adicionado ao carrinho');
  };

  // Handle removing items from cart
  const handleRemoveItem = (itemId: string) => {
    setCartItems(prevItems => {
      const newItems = { ...prevItems };
      if (newItems[itemId] > 1) {
        newItems[itemId]--;
      } else {
        delete newItems[itemId];
      }
      
      // Save to localStorage
      if (id) {
        const cartData = Object.keys(newItems).map(id => ({
          id,
          quantity: newItems[id]
        }));
        localStorage.setItem(`cart_${id}`, JSON.stringify(cartData));
      }
      
      return newItems;
    });
  };

  if (isLoading) {
    return (
      <div className="container py-10 text-center">
        <p className="text-lg">Carregando cardápio...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-10 text-center">
        <p className="text-lg text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="container py-6 pb-24 relative">
      <h1 className="text-3xl font-bold mb-4">Cardápio</h1>

      <div className="flex flex-col md:flex-row items-center justify-between mb-6">
        <div className="flex items-center mb-4 md:mb-0">
          <RestaurantIcon className="mr-2 h-6 w-6 text-gray-500" />
          <p className="text-gray-600">
            {id ? `Mostrando itens do restaurante com ID: ${id}` : 'Mostrando todos os itens'}
          </p>
        </div>

        <Input
          type="text"
          placeholder="Buscar item..."
          className="max-w-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {menuItems.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-lg">Nenhum item encontrado no cardápio deste restaurante.</p>
        </div>
      ) : (
        <Tabs defaultValue="todos" className="space-y-4">
          <TabsList>
            {categories.map((category) => (
              <TabsTrigger
                key={category}
                value={category.toLowerCase()}
                onClick={() => setActiveCategory(category)}
                className="capitalize"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category} value={category.toLowerCase()}>
              {filteredMenuItems.filter(item => activeCategory === 'Todos' || item.category === category).length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                  {filteredMenuItems
                    .filter(item => activeCategory === 'Todos' || item.category === category)
                    .map((item) => (
                      <MenuItemCard
                        key={item.id}
                        item={{
                          id: item.id,
                          name: item.name,
                          description: item.description,
                          price: item.price,
                          image: item.image_url,
                          category: item.category,
                          popular: item.popular || false,
                          vegetarian: item.vegetarian || false,
                          spicy: item.spicy || false,
                        }}
                        quantity={cartItems[item.id] || 0}
                        onAdd={() => handleAddItem(item.id)}
                        onRemove={() => handleRemoveItem(item.id)}
                      />
                    ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-lg text-gray-500">
                    Nenhum item encontrado nesta categoria.
                  </p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
      
      {/* Floating Cart Button */}
      {totalCartItems > 0 && (
        <div className="fixed bottom-8 right-8 z-50">
          <Button asChild size="lg" className="rounded-full h-16 w-16 shadow-lg">
            <Link to="/carrinho" className="relative">
              <ShoppingCartIcon className="h-6 w-6" />
              <Badge variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center rounded-full p-0">
                {totalCartItems}
              </Badge>
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default Menu;
