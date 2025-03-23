
import React from 'react';
import { Conversation, MessageRecord } from './types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import ChatContact from './ChatContact';
import { ChatIcon } from '@/assets/icons';

interface ContactsListProps {
  conversations: Conversation[];
  activeConversation: string | null;
  messages: MessageRecord;
  setMessages: React.Dispatch<React.SetStateAction<MessageRecord>>;
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  setActiveConversation: React.Dispatch<React.SetStateAction<string | null>>;
}

const ContactsList = ({ 
  conversations, 
  activeConversation, 
  messages, 
  setMessages, 
  setConversations, 
  setActiveConversation 
}: ContactsListProps) => {
  return (
    <Card className="md:col-span-1">
      <CardContent className="p-4">
        <ScrollArea className="h-[500px]">
          <div className="space-y-1">
            {conversations.map(conversation => (
              <ChatContact 
                key={conversation.id}
                conversation={conversation}
                active={activeConversation === conversation.id}
                onClick={() => {
                  setActiveConversation(conversation.id);
                  
                  // Marcar mensagens como lidas
                  if (messages[conversation.id]) {
                    setMessages(prevMessages => ({
                      ...prevMessages,
                      [conversation.id]: prevMessages[conversation.id].map(msg => ({ ...msg, read: true }))
                    }));
                    
                    // Atualizar contagem de não lidas
                    setConversations(prevConversations => 
                      prevConversations.map(conv => 
                        conv.id === conversation.id ? { ...conv, unread: 0 } : conv
                      )
                    );
                  }
                }}
              />
            ))}
            
            {conversations.length === 0 && (
              <div className="text-center py-10">
                <ChatIcon className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">
                  Nenhuma conversa iniciada
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ContactsList;
