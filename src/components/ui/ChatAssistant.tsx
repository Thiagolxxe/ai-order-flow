
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChatIcon, CloseIcon, AIIcon } from '@/assets/icons';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

const ChatAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Rolagem automática para o final das mensagens
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Mensagem de boas-vindas inicial
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        text: "Olá! Eu sou seu assistente virtual. Como posso ajudá-lo hoje com seus pedidos de comida ou consultas sobre restaurantes?",
        sender: 'assistant',
        timestamp: new Date()
      };
      
      setIsTyping(true);
      // Simular atraso de digitação
      setTimeout(() => {
        setMessages([welcomeMessage]);
        setIsTyping(false);
      }, 1000);
    }
  }, [isOpen, messages.length]);
  
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages([...messages, userMessage]);
    setInputValue('');
    setIsTyping(true);
    
    // Simular resposta da IA (conectaria com API real em produção)
    setTimeout(() => {
      const botResponses = [
        "Posso ajudá-lo a encontrar restaurantes próximos. Poderia compartilhar sua localização ou área?",
        "Claro, posso ajudá-lo a rastrear seu pedido. Poderia fornecer o número do pedido?",
        "Posso sugerir alguns pratos populares desse restaurante. Que tipo de culinária você está com vontade?",
        "Os tempos de entrega normalmente variam de 30-45 minutos dependendo da distância e do volume de pedidos.",
        "Compreendo. Vou conectá-lo com nossa equipe de suporte para resolver esse problema."
      ];
      
      const randomResponse = botResponses[Math.floor(Math.random() * botResponses.length)];
      
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        text: randomResponse,
        sender: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(messages => [...messages, assistantMessage]);
      setIsTyping(false);
    }, 1500);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  return (
    <>
      {/* Botão de alternância do chat */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'fixed bottom-6 right-6 p-4 rounded-full shadow-elevation-3 z-40 transition-all duration-300',
          isOpen ? 'bg-destructive hover:bg-destructive/90' : 'bg-primary hover:bg-primary/90'
        )}
        size="icon"
      >
        {isOpen ? <CloseIcon className="w-5 h-5" /> : <ChatIcon className="w-5 h-5" />}
      </Button>
      
      {/* Janela de chat */}
      <div 
        className={cn(
          'fixed bottom-24 right-6 w-[350px] max-h-[600px] bg-card rounded-2xl shadow-elevation-3 z-30 flex flex-col overflow-hidden transition-all duration-300 transform',
          isOpen ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'
        )}
      >
        {/* Cabeçalho */}
        <div className="bg-primary text-primary-foreground p-4 flex items-center gap-3">
          <AIIcon className="w-6 h-6" />
          <div>
            <h3 className="font-medium">Assistente Virtual</h3>
            <p className="text-xs opacity-80">Pergunte-me qualquer coisa sobre seus pedidos</p>
          </div>
        </div>
        
        {/* Mensagens */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px] max-h-[400px]">
          {messages.map((message) => (
            <div 
              key={message.id}
              className={cn(
                'flex',
                message.sender === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div 
                className={cn(
                  'max-w-[80%] rounded-2xl p-3 animate-fade-in',
                  message.sender === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-tr-none' 
                    : 'bg-secondary text-foreground rounded-tl-none'
                )}
              >
                <p className="text-sm">{message.text}</p>
                <span className="text-xs opacity-70 mt-1 block text-right">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-secondary text-foreground rounded-2xl rounded-tl-none p-3 max-w-[80%]">
                <div className="flex space-x-2 items-center">
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse"></div>
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        {/* Input */}
        <div className="border-t p-3">
          <div className="relative">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Digite sua mensagem..."
              className="w-full p-3 pr-12 rounded-lg text-sm focus:outline-none focus:ring-2 ring-primary/30 bg-secondary resize-none max-h-32"
              rows={1}
            />
            <Button 
              onClick={handleSendMessage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full h-8 w-8"
              size="icon"
              disabled={!inputValue.trim() || isTyping}
            >
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.20308 1.04312C1.00481 0.954998 0.77934 0.980478 0.603629 1.11265C0.427917 1.24482 0.330197 1.46457 0.350604 1.68733L0.699184 6L13.0002 7.5L0.699184 9L0.350604 13.3127C0.330197 13.5354 0.427917 13.7552 0.603629 13.8874C0.77934 14.0195 1.00481 14.045 1.20308 13.9569L14.0051 7.95685C14.214 7.86549 14.3502 7.66548 14.3502 7.44995C14.3502 7.23442 14.214 7.03441 14.0051 6.94305L1.20308 1.04312Z" fill="currentColor" />
              </svg>
            </Button>
          </div>
          <p className="text-xs text-foreground/50 mt-2 text-center">
            Desenvolvido com tecnologia de IA
          </p>
        </div>
      </div>
    </>
  );
};

export default ChatAssistant;
