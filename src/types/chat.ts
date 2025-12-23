/**
 * Chat message types for the portfolio assistant
 */

export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
}

export interface ChatApiRequest {
  message: string;
  conversationHistory: ChatMessage[];
}

export interface ChatApiResponse {
  reply: string;
  error?: string;
}

export interface ChatApiError {
  error: string;
  details?: string;
}
