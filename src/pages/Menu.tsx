import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RestaurantIcon } from '@/assets/icons';
import { useToast } from "@/hooks/use-toast";

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  restaurant_id: string;
}

const Menu = () => {
  const { id } = useParams<{ id: string }>();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('Todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchMenu = async () => {
      try {
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
          },
          {
            id: '7',
            name: 'Portuguesa Pizza',
            description: 'Classic pizza with tomato sauce, mozzarella, and basil',
            price: 42.90,
            category: 'Pizzas',
            image_url: '/pizza.jpg',
            restaurant_id: id,
          },
          {
            id: '8',
            name: 'Salada Tropical',
            description: 'Fresh salad with romaine lettuce, croutons, and Caesar dressing',
            price: 24.90,
            category: 'Saladas',
            image_url: '/salad.jpg',
            restaurant_id: id,
          },
          {
            id: '9',
            name: 'Mousse de Maracujá',
            description: 'Rich chocolate cake with chocolate frosting',
            price: 26.90,
            category: 'Sobremesas',
            image_url: '/cake.jpg',
            restaurant_id: id,
          },
          {
            id: '10',
            name: 'Suco de Laranja',
            description: 'Refreshing Coca-Cola',
            price: 18.90,
            category: 'Bebidas',
            image_url: '/coke.jpg',
            restaurant_id: id,
          },
        ];

        setMenuItems(mockMenu);

        // Extract unique categories
        const uniqueCategories = ['Todos', ...new Set(mockMenu.map((item) => item.category))];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error("Failed to fetch menu items", error);
        toast({
          title: "Erro ao carregar cardápio",
          description: "Não foi possível carregar os itens do cardápio.",
          variant: "destructive",
        });
      }
    };

    fetchMenu();
  }, [id, toast]);

  const filteredMenuItems = menuItems.filter((item) => {
    const searchTermLower = searchTerm.toLowerCase();
    const itemNameLower = item.name.toLowerCase();
    return (
      (activeCategory === 'Todos' || item.category === activeCategory) &&
      (searchTerm === '' || itemNameLower.includes(searchTermLower))
    );
  });

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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMenuItems.filter(item => activeCategory === 'Todos' || item.category === category).map((item) => (
                  <Card key={item.id} className="bg-white shadow-md rounded-md overflow-hidden">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-full h-48 object-cover"
                    />
                    <CardContent className="p-4">
                      <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
                      <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-primary">
                          R$ {item.price.toFixed(2).replace('.', ',')}
                        </span>
                        <Button size="sm">Adicionar</Button>
                      </div>
                    </CardContent>
                  </Card>
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
