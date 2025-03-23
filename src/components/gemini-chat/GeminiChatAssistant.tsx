
import React, { useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Sparkles } from "lucide-react";
import { useGeminiAI } from '@/hooks/useGeminiAI';
import { useCart } from '@/hooks/useCart';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';
import SuggestionsList from './SuggestionsList';

const GeminiChatAssistant: React.FC = () => {
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
  
  // Handle suggestion click
  const handleSuggestionClick = async (suggestion: string) => {
    await sendMessage(suggestion);
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
      <SheetContent className="w-full sm:max-w-md p-0 h-[95vh] flex flex-col">
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
          
          <TabsContent value="chat" className="flex-1 flex flex-col p-0 overflow-hidden">
            <div className="flex-1 overflow-hidden flex flex-col">
              <ChatMessages 
                messages={messages} 
                isLoading={isLoading} 
              />
              <ChatInput 
                onSendMessage={sendMessage} 
                isLoading={isLoading} 
              />
            </div>
          </TabsContent>
          
          <TabsContent value="suggestions" className="flex-1 p-0 overflow-hidden">
            <SuggestionsList 
              suggestions={suggestions} 
              onSuggestionClick={handleSuggestionClick}
              restaurant={restaurant}
              cartItems={cartItems}
            />
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default GeminiChatAssistant;
