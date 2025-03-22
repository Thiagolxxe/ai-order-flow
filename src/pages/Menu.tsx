import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RestaurantIcon } from '@/assets/icons';
import { useToast } from "@/hooks/use-toast";
import { toast } from 'sonner';
import MenuItemCard from '@/components/food/MenuItemCard';

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
  const { toast: uiToast } = useToast();

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        // Validate restaurant ID format
        if (id && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) {
          console.error('Invalid UUID format for restaurant ID:', id);
          toast('ID de restaurante inválido');
          return;
        }

        // For now, we'll use mock data
        // In a real app, you would fetch from Supabase like:
        // const { data, error } = await supabase
        //   .from('itens_cardapio')
        //   .select('*')
        //   .eq('restaurante_id', id);
        
        const mockMenu = [
          {
            id: '1',
            name: 'Classic Burger',
            description: 'Delicious burger with lettuce, tomato, and cheese',
            price: 26.90,
            category: 'Hambúrgueres',
            image_url: '/burger.jpg',
            restaurant_id: id,
          },
          {
            id: '2',
            name: 'Margherita Pizza',
            description: 'Classic pizza with tomato sauce, mozzarella, and basil',
            price: 32.90,
            category: 'Pizzas',
            image_url: '/pizza.jpg',
            restaurant_id: id,
          },
          {
            id: '3',
            name: 'Caesar Salad',
            description: 'Fresh salad with romaine lettuce, croutons, and Caesar dressing',
            price: 14.90,
            category: 'Saladas',
            image_url: '/salad.jpg',
            restaurant_id: id,
          },
          {
            id: '4',
            name: 'Chocolate Cake',
            description: 'Rich chocolate cake with chocolate frosting',
            price: 16.90,
            category: 'Sobremesas',
            image_url: '/cake.jpg',
            restaurant_id: id,
          },
          {
            id: '5',
            name: 'Coca-Cola',
            description: 'Refreshing Coca-Cola',
            price: 8.90,
            category: 'Bebidas',
            image_url: '/coke.jpg',
            restaurant_id: id,
          },
          {
            id: '6',
            name: 'Cheeseburger Bacon',
            description: 'Delicious burger with lettuce, tomato, and cheese',
            price: 35.90,
            category: 'Hambúrgueres',
            image_url: '/burger.jpg',
            restaurant_id: id,
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
            restaurant_id: id,
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
            restaurant_id: id,
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
            restaurant_id: id,
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
            restaurant_id: id,
            popular: false,
            vegetarian: true,
            spicy: false,
          },
        ];

        setMenuItems(mockMenu);

        // Extract unique categories
        const uniqueCategories = ['Todos', ...new Set(mockMenu.map((item) => item.category))];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Failed to fetch menu items", error);
        uiToast({
          title: "Erro ao carregar cardápio",
          description: "Não foi possível carregar os itens do cardápio.",
          variant: "destructive",
        });
      }
    };

    fetchMenu();
  }, [id, uiToast]);

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
    setCartItems(prevItems => ({
      ...prevItems,
      [itemId]: (prevItems[itemId] || 0) + 1
    }));
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
      return newItems;
    });
  };

  return (
    <div className="container py-6">
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
    </div>
  );
};

export default Menu;
