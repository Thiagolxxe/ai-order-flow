
// This file is now deprecated - import from src/services/gemini instead
import { 
  generateGeminiResponse,
  handleFunctionCall,
  fetchUserContext
} from './gemini';

import type {
  OrderContext,
  ChatMessage,
  FunctionResponse,
  GeminiResponse
} from './gemini';

export {
  generateGeminiResponse,
  handleFunctionCall,
  fetchUserContext
};

export type {
  OrderContext,
  ChatMessage,
  FunctionResponse,
  GeminiResponse
};
