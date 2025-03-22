
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingCart, Search } from "lucide-react";
import MenuItemCard, { MenuItem } from '@/components/food/MenuItemCard';
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import CartItemCard from '@/components/food/CartItemCard';
import { toast } from "sonner";

// Mock data categories for demonstration
const menuCategories = [
  "Todos",
  "Entradas",
  "Pratos Principais",
  "Sobremesas",
  "Bebidas"
];

// Mock menu items
const mockMenuItems: MenuItem[] = [
  {
    id: "1",
    name: "Salada Caesar",
    description: "Alface romana, croutons, parmesão e molho Caesar",
    price: 28.90,
    image: "https://source.unsplash.com/random/300x200/?salad",
    imageUrl: "https://source.unsplash.com/random/300x200/?salad",
    category: "Entradas"
  },
  {
    id: "2",
    name: "Risoto de Funghi",
    description: "Arroz arbóreo, mix de cogumelos, manteiga e parmesão",
    price: 49.90,
    image: "https://source.unsplash.com/random/300x200/?risotto",
    imageUrl: "https://source.unsplash.com/random/300x200/?risotto",
    category: "Pratos Principais"
  },
  {
    id: "3",
    name: "Tiramisu",
    description: "Sobremesa italiana com café, queijo mascarpone e cacau",
    price: 24.90,
    image: "https://source.unsplash.com/random/300x200/?tiramisu",
    imageUrl: "https://source.unsplash.com/random/300x200/?tiramisu",
    category: "Sobremesas"
  },
  {
    id: "4",
    name: "Suco Natural",
    description: "Suco de frutas frescas sem adição de açúcar",
    price: 12.90,
    image: "https://source.unsplash.com/random/300x200/?juice",
    imageUrl: "https://source.unsplash.com/random/300x200/?juice",
    category: "Bebidas"
  },
  {
    id: "5",
    name: "Carpaccio",
    description: "Finas fatias de carne crua, alcaparras, mostarda e parmesão",
    price: 36.90,
    image: "https://source.unsplash.com/random/300x200/?carpaccio",
    imageUrl: "https://source.unsplash.com/random/300x200/?carpaccio",
    category: "Entradas"
  },
];

const Menu = () => {
  const { id: restaurantId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [cartItems, setCartItems] = useState<{id: string, quantity: number}[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>(mockMenuItems);
  
  // Load cart from localStorage
  useEffect(() => {
    if (!restaurantId) return;
    
    const savedCart = localStorage.getItem(`cart_${restaurantId}`);
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      } catch (e) {
        console.error('Error parsing cart from localStorage:', e);
      }
    }
  }, [restaurantId]);
  
  // Save cart to localStorage when it changes
  useEffect(() => {
    if (!restaurantId || cartItems.length === 0) return;
    localStorage.setItem(`cart_${restaurantId}`, JSON.stringify(cartItems));
  }, [cartItems, restaurantId]);
  
  const handleAddToCart = (itemId: string) => {
    // Check if item is already in cart
    const existingItem = cartItems.find(item => item.id === itemId);
    
    if (existingItem) {
      // Update quantity if item exists
      setCartItems(cartItems.map(item => 
        item.id === itemId 
          ? { ...item, quantity: item.quantity + 1 } 
          : item
      ));
    } else {
      // Add new item to cart
      setCartItems([...cartItems, { id: itemId, quantity: 1 }]);
    }
    
    toast.success("Item adicionado ao carrinho");
  };
  
  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      // Remove item if quantity is 0 or less
      setCartItems(cartItems.filter(item => item.id !== itemId));
      toast.info("Item removido do carrinho");
    } else {
      // Update quantity
      setCartItems(cartItems.map(item => 
        item.id === itemId 
          ? { ...item, quantity: newQuantity } 
          : item
      ));
    }
  };
  
  const handleCheckout = () => {
    navigate(`/checkout/${restaurantId}`);
  };
  
  // Filter menu items by category and search query
  const filteredItems = menuItems.filter(item => 
    (selectedCategory === "Todos" || item.category === selectedCategory) &&
    (item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Calculate total items in cart
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  // Calculate total price
  const totalPrice = cartItems.reduce((sum, cartItem) => {
    const menuItem = menuItems.find(item => item.id === cartItem.id);
    return sum + (menuItem ? menuItem.price * cartItem.quantity : 0);
  }, 0);
  
  return (
    <div className="container py-6">
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold">Cardápio</h1>
              <p className="text-muted-foreground">
                Explore nosso menu e faça seu pedido
              </p>
            </div>
            
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar no cardápio..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-full md:w-[300px]"
              />
            </div>
          </div>
          
          <Tabs defaultValue="Todos" value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="mb-6 w-full overflow-x-auto flex flex-nowrap">
              {menuCategories.map(category => (
                <TabsTrigger key={category} value={category} className="px-4">
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {menuCategories.map(category => (
              <TabsContent key={category} value={category}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredItems.map(item => {
                    const cartItem = cartItems.find(ci => ci.id === item.id);
                    const quantity = cartItem ? cartItem.quantity : 0;
                    
                    return (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        quantity={quantity}
                        onAdd={() => handleAddToCart(item.id)}
                        onRemove={() => handleUpdateQuantity(item.id, quantity - 1)}
                      />
                    );
                  })}
                </div>
                
                {filteredItems.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Nenhum item encontrado para essa categoria ou busca.
                    </p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Floating cart button */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            className="fixed bottom-4 right-4 h-16 w-16 rounded-full shadow-lg"
            size="icon"
          >
            <ShoppingCart className="h-6 w-6" />
            {totalItems > 0 && (
              <Badge 
                variant="destructive"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center"
              >
                {totalItems}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        
        <SheetContent className="sm:max-w-md w-full">
          <SheetHeader>
            <SheetTitle>Seu Carrinho</SheetTitle>
          </SheetHeader>
          
          <div className="mt-6 flex flex-col h-[calc(100vh-10rem)]">
            {cartItems.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  Seu carrinho está vazio. Adicione itens para continuar.
                </p>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-auto">
                  {cartItems.map(cartItem => {
                    const menuItem = menuItems.find(item => item.id === cartItem.id);
                    if (!menuItem) return null;
                    
                    return (
                      <CartItemCard
                        key={cartItem.id}
                        item={menuItem}
                        quantity={cartItem.quantity}
                        onUpdateQuantity={(newQuantity: number) => 
                          handleUpdateQuantity(cartItem.id, newQuantity)
                        }
                      />
                    );
                  })}
                </div>
                
                <div className="border-t pt-4 mt-auto">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Subtotal</span>
                    <span>R$ {totalPrice.toFixed(2).replace('.', ',')}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-4">
                    <span>Taxa de entrega</span>
                    <span>R$ 10,00</span>
                  </div>
                  <div className="flex justify-between font-bold mb-6">
                    <span>Total</span>
                    <span>R$ {(totalPrice + 10).toFixed(2).replace('.', ',')}</span>
                  </div>
                  
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleCheckout}
                  >
                    Finalizar Pedido
                  </Button>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Menu;
