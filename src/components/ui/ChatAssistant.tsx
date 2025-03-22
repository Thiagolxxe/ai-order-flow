
// Import the ChatAssistant component and other necessary dependencies
import React, { useState } from 'react';
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
import { MessageCircle } from "lucide-react";

// Define message types
interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

// Define conversation history interface
interface ConversationHistory {
  id: string;
  title: string;
  lastMessageDate: Date;
}

const ChatAssistant: React.FC = () => {
  // State for messages in current conversation
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Olá! Como posso ajudar você hoje?',
      sender: 'assistant',
      timestamp: new Date()
    }
  ]);
  
  // State for user input
  const [input, setInput] = useState('');
  
  // State for conversation history
  const [conversationHistory, setConversationHistory] = useState<ConversationHistory[]>([
    {
      id: 'current',
      title: 'Conversa atual',
      lastMessageDate: new Date()
    },
    {
      id: 'previous1',
      title: 'Ajuda com entrega',
      lastMessageDate: new Date(Date.now() - 24 * 60 * 60 * 1000)
    },
    {
      id: 'previous2',
      title: 'Problema com pagamento',
      lastMessageDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
    }
  ]);
  
  // Function to handle sending messages
  const handleSendMessage = () => {
    if (input.trim() === '') return;
    
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages([...messages, userMessage]);
    setInput('');
    
    // Simulate assistant response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Obrigado por sua mensagem. Um de nossos atendentes responderá em breve.',
        sender: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    }, 1000);
  };
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-lg border-primary"
        >
          <MessageCircle />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md p-0 h-full flex flex-col">
        <SheetHeader className="p-4 border-b">
          <SheetTitle>Assistente de Atendimento</SheetTitle>
        </SheetHeader>
        
        <Tabs defaultValue="chat" className="flex-1 flex flex-col">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="chat">Chat</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat" className="flex-1 flex flex-col p-0">
            <div className="flex-1 overflow-auto p-4">
              {messages.map(message => (
                <div 
                  key={message.id}
                  className={`mb-4 max-w-[80%] ${
                    message.sender === 'user' 
                      ? 'ml-auto bg-primary text-white' 
                      : 'mr-auto bg-secondary text-foreground'
                  } rounded-lg p-3`}
                >
                  <p>{message.content}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))}
            </div>
            
            <div className="p-4 border-t mt-auto">
              <div className="flex space-x-2">
                <Input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button onClick={handleSendMessage}>Enviar</Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="history" className="flex-1 overflow-auto p-4">
            <h3 className="font-medium mb-3">Conversas anteriores</h3>
            <div className="space-y-2">
              {conversationHistory.map(conversation => (
                <div 
                  key={conversation.id}
                  className="p-3 border rounded-md cursor-pointer hover:bg-secondary transition-colors"
                >
                  <h4 className="font-medium">{conversation.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {conversation.lastMessageDate.toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

export default ChatAssistant;
