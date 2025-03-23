
import React from 'react';
import { ChatIcon } from '@/assets/icons';

const EmptyChatState = () => {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center p-6">
        <ChatIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">Nenhuma conversa selecionada</h3>
        <p className="text-muted-foreground max-w-md">
          Selecione uma conversa à esquerda ou inicie uma nova conversa a partir 
          de um pedido.
        </p>
      </div>
    </div>
  );
};

export default EmptyChatState;
