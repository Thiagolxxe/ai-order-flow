
import React, { useState, useRef, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  Send, 
  Sparkles,
  ShoppingCart,
  MapPin,
  ChevronRight
} from "lucide-react";
import { useGeminiAI, Message } from '@/hooks/useGeminiAI';
import { useCart } from '@/hooks/useCart';

const GeminiChatAssistant: React.FC = () => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { cartItems, restaurant } = useCart();
  
  // Initialize Gemini AI hook with cart context
  const { 
    messages, 
    isLoading, 
    sendMessage, 
    updateContext,
    suggestions
  } = useGeminiAI({
    restaurantId: restaurant?.id,
    restaurantName: restaurant?.nome,
    cartItems: cartItems
  });
  
  // Update context when cart changes
  useEffect(() => {
    updateContext({
      restaurantId: restaurant?.id,
      restaurantName: restaurant?.nome,
      cartItems: cartItems
    });
  }, [restaurant, cartItems, updateContext]);
  
  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  // Handle sending messages
  const handleSendMessage = async () => {
    if (input.trim() === '') return;
    await sendMessage(input);
    setInput('');
  };
  
  // Handle suggestion click
  const handleSuggestionClick = async (suggestion: string) => {
    await sendMessage(suggestion);
  };
  
  // Render message content with formatting
  const renderMessageContent = (content: string) => {
    // Basic markdown-like formatting
    return content
      .split('\n')
      .map((line, i) => {
        // Bold text
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Italic text
        line = line.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        return line ? <p key={i} dangerouslySetInnerHTML={{ __html: line }} /> : <br key={i} />;
      });
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-lg border-primary bg-white"
        >
          <Sparkles className="h-6 w-6 text-primary" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md p-0 h-full flex flex-col">
        <SheetHeader className="p-4 border-b">
          <SheetTitle className="flex items-center">
            <Sparkles className="mr-2 h-5 w-5 text-primary" />
            Assistente Virtual DelivGo
          </SheetTitle>
        </SheetHeader>
        
        <Tabs defaultValue="chat" className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="suggestions">Sugestões</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat" className="flex-1 flex flex-col p-0">
            <div className="flex-1 overflow-auto p-4">
              {messages.map((message) => (
                <div 
                  key={message.id}
                  className={`mb-4 max-w-[80%] ${
                    message.role === 'user' 
                      ? 'ml-auto bg-primary text-primary-foreground' 
                      : 'mr-auto bg-muted'
                  } rounded-lg p-3`}
                >
                  <div className="text-sm">
                    {renderMessageContent(message.content)}
                  </div>
                  <p className="text-xs mt-1 opacity-70 text-right">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))}
              {isLoading && (
                <div className="mr-auto bg-muted rounded-lg p-3 mb-4 max-w-[80%]">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 bg-primary rounded-full animate-bounce delay-75"></div>
                    <div className="h-2 w-2 bg-primary rounded-full animate-bounce delay-150"></div>
                    <div className="h-2 w-2 bg-primary rounded-full animate-bounce delay-300"></div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="p-4 border-t mt-auto">
              <div className="flex space-x-2">
                <Input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={isLoading}
                />
                <Button onClick={handleSendMessage} disabled={isLoading}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="suggestions" className="flex-1 overflow-auto p-4">
            <h3 className="font-medium mb-3">Sugestões do assistente</h3>
            {suggestions.length > 0 ? (
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start text-left h-auto py-3"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <span className="truncate">{suggestion}</span>
                    <ChevronRight className="ml-auto h-4 w-4 flex-shrink-0" />
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">
                Nenhuma sugestão disponível no momento.
              </p>
            )}
            
            {restaurant && (
              <div className="mt-6">
                <h4 className="font-medium mb-2 flex items-center">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Resumo do Pedido
                </h4>
                <div className="bg-muted p-3 rounded-md">
                  <p className="font-medium">{restaurant.nome}</p>
                  {cartItems.length > 0 ? (
                    <div className="mt-2 space-y-1 text-sm">
                      {cartItems.map((item, index) => (
                        <div key={index} className="flex justify-between">
                          <span>{item.quantity}x {item.name}</span>
                          <span>R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-1">
                      Seu carrinho está vazio
                    </p>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default GeminiChatAssistant;
