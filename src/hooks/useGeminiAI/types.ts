
import { OrderContext, ChatMessage } from '@/services/gemini';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface UseGeminiAIProps {
  initialContext?: Partial<OrderContext>;
}

export interface UseGeminiAIReturn {
  messages: Message[];
  isLoading: boolean;
  sendMessage: (messageContent: string) => Promise<void>;
  updateContext: (newContext: Partial<OrderContext>) => void;
  suggestions: string[];
  context: OrderContext;
}
