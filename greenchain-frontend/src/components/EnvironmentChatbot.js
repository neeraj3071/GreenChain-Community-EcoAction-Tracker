import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, MessageCircle, Send, Sparkles, X } from 'lucide-react';
import { chatbotService } from '../services/auth';

const EnvironmentChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [messages, setMessages] = useState([]);

  const recentHistory = useMemo(
    () =>
      messages
        .slice(-10)
        .map((message) => ({ role: message.role, content: message.content })),
    [messages]
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const timer = window.requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });

    return () => window.cancelAnimationFrame(timer);
  }, [messages, isOpen, isLoading]);

  const sendMessage = async (rawQuestion) => {
    const question = rawQuestion.trim();
    if (!question || isLoading) {
      return;
    }

    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: question,
      },
    ]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatbotService.askQuestion(question, recentHistory);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: response.answer,
          topic: response.topic,
          suggestedActions: response.suggested_actions || [],
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'I could not reach the environment assistant right now. Please try again in a moment.',
          topic: 'general',
          suggestedActions: [],
        },
      ]);
      console.error('Chatbot error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className="eco-chat-launcher premium-interactive"
        aria-label={isOpen ? 'Close environment chatbot' : 'Open environment chatbot'}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
        <span className="hidden sm:inline">Eco Chat</span>
      </button>

      {isOpen && (
        <section className="eco-chat-panel" aria-label="Environment chatbot panel">
          <header className="eco-chat-header">
            <div className="eco-chat-title-wrap">
              <Sparkles className="h-4 w-4" />
              <h3>Eco Assistant</h3>
            </div>
            <p>Ask about sustainability, carbon reduction, and eco habits.</p>
          </header>

          <div className="eco-chat-body">
            {messages.map((message, index) => (
              <article
                key={`${message.role}-${index}`}
                className={`eco-chat-bubble ${message.role === 'user' ? 'is-user' : 'is-assistant'}`}
              >
                <p>{message.content}</p>
                {message.role === 'assistant' && Array.isArray(message.suggestedActions) && message.suggestedActions.length > 0 && (
                  <ul className="eco-chat-actions">
                    {message.suggestedActions.slice(0, 3).map((action, actionIndex) => (
                      <li key={`${action}-${actionIndex}`}>{action}</li>
                    ))}
                  </ul>
                )}
              </article>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form
            className="eco-chat-input-row"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage(input);
            }}
          >
            <input
              type="text"
              placeholder="Ask how to improve the environment..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading || !input.trim()} aria-label="Send chat message">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </form>
        </section>
      )}
    </>
  );
};

export default EnvironmentChatbot;
