/**
 * AI-Powered Portfolio Assistant Chat Widget
 *
 * Features:
 * - Smooth expand/collapse animations
 * - Message history with user/assistant differentiation
 * - localStorage persistence
 * - Loading states and error handling
 * - Responsive design (desktop/mobile)
 * - Accessibility (keyboard navigation, ARIA labels, screen reader support)
 */

import { useState, useEffect, useRef } from 'react';
import type { FormEvent, KeyboardEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import type { ChatMessage } from '../types/chat';
import {
  sendChatMessage,
  loadChatHistory,
  saveChatHistory,
  clearChatHistory,
} from '../lib/chatApi';
import { XIcon } from './ui/x';
import { SparklesIcon } from './ui/sparkles';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    setError(null);
  };

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear the chat history?')) {
      setMessages([]);
      clearChatHistory();
      setError(null);
    }
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
    <>
      {/* Floating Button (Closed State) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleToggle}
            className="fixed bottom-6 right-6 w-[60px] h-[60px] bg-linear-to-br from-coral-500 to-coral-500/50 rounded-full shadow-lg hover:shadow-xl flex items-center justify-center text-white z-50 focus:outline-none focus:ring-4 focus:ring-coral-300"
            aria-label="Open portfolio assistant chat"
          >
            <SparklesIcon size={28} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Panel (Expanded State) */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Mobile Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={handleToggle}
              aria-hidden="true"
            />

            {/* Chat Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-6 right-6 w-full md:w-[400px] h-[90vh] md:h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden"
              role="dialog"
              aria-label="Portfolio assistant chat"
            >
              {/* Header */}
              <div className="bg-linear-to-r from-coral-500 to-coral-500/60 text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <SparklesIcon size={24} />
                  <div>
                    <h2 className="font-semibold text-lg">Portfolio Assistant!</h2>
                    <p className="text-xs text-coral-100">Powered by Claude AI</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {messages.length > 0 && (
                    <button
                      onClick={handleClearHistory}
                      className="p-2 hover:bg-coral-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                      aria-label="Clear chat history"
                      title="Clear chat history"
                    >
                      <XIcon size={18} />
                    </button>
                  )}
                  <button
                    onClick={handleToggle}
                    className="p-2 hover:bg-coral-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                    aria-label="Close chat"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 bg-cream-50">
                {messages.length === 0 && (
                  <div className="text-center text-gray-500 mt-8">
                    <MessageCircle size={48} className="mx-auto mb-4 text-coral-300" />
                    <p className="text-lg font-medium">Hi! I'm your portfolio assistant.</p>
                    <p className="text-sm mt-2">
                      Ask me anything about Felipe's experience, skills, or projects!
                    </p>
                  </div>
                )}

                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-3 rounded-2xl ${message.role === 'user'
                        ? 'bg-coral-500 text-white rounded-br-sm'
                        : 'bg-white text-dark-900 rounded-bl-sm shadow-sm'
                        }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap wrap-break-word">
                        {message.content}
                      </p>
                      <p
                        className={`text-xs mt-1 ${message.role === 'user' ? 'text-coral-100' : 'text-gray-400'
                          }`}
                      >
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </motion.div>
                ))}

                {/* Loading Indicator */}
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white text-dark-900 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-2">
                      <Loader2 size={16} className="animate-spin text-coral-500" />
                      <span className="text-sm text-gray-600">Thinking...</span>
                    </div>
                  </motion.div>
                )}

                {/* Error Display */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm"
                    role="alert"
                  >
                    <strong className="font-medium">Error:</strong> {error}
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-200 bg-white px-4 py-4">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask me anything..."
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-dark-900 placeholder:text-gray-400"
                    aria-label="Chat message input"
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isLoading}
                    className="px-5 py-3 bg-coral-500 text-white rounded-xl hover:bg-coral-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-coral-500 focus:ring-offset-2 min-w-11 flex items-center justify-center"
                    aria-label="Send message"
                  >
                    {isLoading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <Send size={20} />
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;
