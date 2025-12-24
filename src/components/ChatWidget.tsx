/**
 * AI-Powered Portfolio Assistant Chat Widget
 *
 * Features:
 * - In-screen bottom-center overlay design
 * - Auto-dismissing messages (5-7 seconds)
 * - Always-visible input bar
 * - Expandable chat history
 * - Message history with user/assistant differentiation
 * - localStorage persistence
 * - Loading states and error handling
 * - Responsive design (desktop/mobile)
 * - Accessibility (keyboard navigation, ARIA labels, screen reader support)
 */

import { useState, useEffect, useRef } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, History, ChevronDown, X } from 'lucide-react';
import type { ChatMessage } from '../types/chat';
import {
  sendChatMessage,
  loadChatHistory,
  saveChatHistory,
  clearChatHistory,
} from '../lib/chatApi';
import { SparklesIcon } from './ui/sparkles';

interface VisibleMessage extends ChatMessage {
  isVisible: boolean;
}

const ChatWidget = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [visibleMessages, setVisibleMessages] = useState<VisibleMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dismissTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Load chat history on mount
  useEffect(() => {
    const history = loadChatHistory();
    setMessages(history);
  }, []);

  // Save chat history whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      saveChatHistory(messages);
    }
  }, [messages]);

  // Auto-dismiss logic: Add new messages to visible list and set timers
  useEffect(() => {
    const newMessages = messages.slice(-3); // Only show last 3 messages
    const visibleMsgs: VisibleMessage[] = newMessages.map((msg) => ({
      ...msg,
      isVisible: true,
    }));

    setVisibleMessages(visibleMsgs);

    // Set auto-dismiss timers for each message
    visibleMsgs.forEach((msg) => {
      // Calculate dismiss time based on message length (5-7 seconds)
      const baseTime = 5000;
      const charCount = msg.content.length;
      const extraTime = Math.min(charCount * 20, 2000); // Max 2s extra for long messages
      const dismissTime = baseTime + extraTime;

      // Clear existing timer if any
      const existingTimer = dismissTimersRef.current.get(msg.id);
      if (existingTimer) {
        clearTimeout(existingTimer);
      }

      // Set new timer
      const timer = setTimeout(() => {
        setVisibleMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, isVisible: false } : m))
        );
      }, dismissTime);

      dismissTimersRef.current.set(msg.id, timer);
    });

    // Cleanup timers on unmount or when messages change
    return () => {
      dismissTimersRef.current.forEach((timer) => clearTimeout(timer));
      dismissTimersRef.current.clear();
    };
  }, [messages]);

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear the chat history?')) {
      setMessages([]);
      setVisibleMessages([]);
      clearChatHistory();
      setError(null);
    }
  };

  const toggleHistory = () => {
    setIsHistoryExpanded(!isHistoryExpanded);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const trimmedMessage = inputValue.trim();
    if (!trimmedMessage || isLoading) return;

    // Create user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmedMessage,
      timestamp: Date.now(),
    };

    // Add user message to chat
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      // Send message to API
      const reply = await sendChatMessage(trimmedMessage, messages);

      // Create assistant message
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);

      // Add error message to chat
      const errorChatMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${errorMessage}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorChatMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
      {/* Expandable History Panel */}
      <AnimatePresence>
        {isHistoryExpanded && (
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 w-full max-w-2xl mb-2 pointer-events-auto"
          >
            <div className="bg-white rounded-t-2xl shadow-2xl max-h-96 overflow-hidden flex flex-col mx-4">
              {/* History Header */}
              <div className="bg-linear-to-r from-coral-500 to-coral-500/60 text-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SparklesIcon size={20} />
                  <h3 className="font-semibold text-sm">Chat History</h3>
                </div>
                <div className="flex items-center gap-2">
                  {messages.length > 0 && (
                    <button
                      onClick={handleClearHistory}
                      className="p-1.5 hover:bg-coral-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                      aria-label="Clear chat history"
                      title="Clear chat history"
                    >
                      <X size={16} />
                    </button>
                  )}
                  <button
                    onClick={toggleHistory}
                    className="p-1.5 hover:bg-coral-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                    aria-label="Close history"
                  >
                    <ChevronDown size={20} />
                  </button>
                </div>
              </div>

              {/* History Messages */}
              <div className="overflow-y-auto px-4 py-3 space-y-3 bg-cream-50 max-h-80">
                {messages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <p className="text-sm">No chat history yet</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] px-3 py-2 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-coral-500 text-white'
                            : 'bg-white text-dark-900 shadow-sm'
                        }`}
                      >
                        <p className="text-xs leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </p>
                        <p
                          className={`text-[10px] mt-1 ${
                            message.role === 'user' ? 'text-coral-100' : 'text-gray-400'
                          }`}
                        >
                          {new Date(message.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Center Container - Always Visible */}
      <div className="flex flex-col items-center pb-4 px-4 pointer-events-auto">
        {/* Visible Messages Area - Auto-dismissing */}
        <div className="w-full max-w-2xl mb-2 space-y-2">
          <AnimatePresence mode="popLayout">
            {visibleMessages
              .filter((msg) => msg.isVisible)
              .map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ y: 20, opacity: 0, scale: 0.95 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={{ y: -10, opacity: 0, scale: 0.95 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-3 rounded-2xl shadow-lg backdrop-blur-sm ${
                      message.role === 'user'
                        ? 'bg-coral-500 text-white'
                        : 'bg-white/95 text-dark-900 border border-gray-200'
                    }`}
                    role="status"
                    aria-live="polite"
                  >
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">
                      {message.content}
                    </p>
                  </div>
                </motion.div>
              ))}

            {/* Loading Indicator */}
            {isLoading && (
              <motion.div
                key="loading"
                initial={{ y: 20, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -10, opacity: 0, scale: 0.95 }}
                className="flex justify-start"
              >
                <div className="bg-white/95 backdrop-blur-sm text-dark-900 px-4 py-3 rounded-2xl shadow-lg border border-gray-200 flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-coral-500" />
                  <span className="text-sm text-gray-600">Thinking...</span>
                </div>
              </motion.div>
            )}

            {/* Error Display */}
            {error && (
              <motion.div
                key="error"
                initial={{ y: 20, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -10, opacity: 0, scale: 0.95 }}
                className="bg-red-50/95 backdrop-blur-sm border border-red-200 text-red-700 px-4 py-3 rounded-2xl shadow-lg text-sm"
                role="alert"
              >
                <strong className="font-medium">Error:</strong> {error}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input Bar - Always Visible */}
        <div className="w-full max-w-2xl">
          <form onSubmit={handleSubmit} className="flex gap-2 items-end">
            {/* History Toggle Button */}
            {messages.length > 0 && (
              <button
                type="button"
                onClick={toggleHistory}
                className="p-3 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-coral-500 text-coral-500"
                aria-label={isHistoryExpanded ? 'Hide chat history' : 'Show chat history'}
                title={isHistoryExpanded ? 'Hide history' : 'Show history'}
              >
                <History size={20} />
              </button>
            )}

            {/* Input Field */}
            <div className="flex-1 bg-white rounded-xl shadow-lg flex items-center gap-2 px-4 py-2 border border-gray-200 focus-within:ring-2 focus-within:ring-coral-500 focus-within:border-transparent">
              <SparklesIcon size={20} className="text-coral-500 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything..."
                disabled={isLoading}
                className="flex-1 py-2 focus:outline-none disabled:bg-transparent disabled:cursor-not-allowed text-dark-900 placeholder:text-gray-400 text-sm"
                aria-label="Chat message input"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="p-2 bg-coral-500 text-white rounded-lg hover:bg-coral-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-coral-500 focus:ring-offset-2 flex items-center justify-center shrink-0"
                aria-label="Send message"
              >
                {isLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatWidget;
