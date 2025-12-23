/**
 * Client-side API integration for chat functionality
 */

import type { ChatMessage, ChatApiRequest, ChatApiResponse, ChatApiError } from '../types/chat';

const API_ENDPOINT = '/api/chat';

/**
 * Sends a message to the chat API and returns the assistant's response
 */
export async function sendChatMessage(
  message: string,
  conversationHistory: ChatMessage[]
): Promise<string> {
  try {
    const requestBody: ChatApiRequest = {
      message,
      conversationHistory,
    };

    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      // Try to parse error response
      let errorMessage = 'Failed to get response from chat assistant';
      try {
        const errorData: ChatApiError = await response.json();
        errorMessage = errorData.error || errorMessage;
      } catch {
        // If parsing fails, use status text
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    const data: ChatApiResponse = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    return data.reply;
  } catch (error) {
    console.error('Error sending chat message:', error);

    // Provide user-friendly error messages
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Unable to connect to chat service. Please check your internet connection.');
    }

    if (error instanceof Error) {
      throw error;
    }

    throw new Error('An unexpected error occurred. Please try again.');
  }
}

/**
 * localStorage key for persisting chat history
 */
const STORAGE_KEY = 'portfolio-chat-history';

/**
 * Loads chat history from localStorage
 */
export function loadChatHistory(): ChatMessage[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];

    // Validate message structure
    return parsed.filter(
      (msg): msg is ChatMessage =>
        typeof msg === 'object' &&
        msg !== null &&
        'id' in msg &&
        'role' in msg &&
        'content' in msg &&
        'timestamp' in msg &&
        (msg.role === 'user' || msg.role === 'assistant')
    );
  } catch (error) {
    console.error('Error loading chat history:', error);
    return [];
  }
}

/**
 * Saves chat history to localStorage
 */
export function saveChatHistory(messages: ChatMessage[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch (error) {
    console.error('Error saving chat history:', error);
  }
}

/**
 * Clears chat history from localStorage
 */
export function clearChatHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing chat history:', error);
  }
}
