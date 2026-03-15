import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
let genAI = null;
if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
}

const SYSTEM_INSTRUCTION = `You are a helpful and compassionate AI assistant for Olympia Home Health Inc. 
Olympia is a home healthcare agency located in Huntington Beach, California, providing holistic, patient-centered care led by Registered Nurses (RNs) across Orange County.
The CEO of Olympia Home Health is Jeonalyn Ashby.
Your tone should be empathetic, professional, and reassuring.
Do not provide medical advice. If someone needs urgent help or medical advice, tell them to call 911 or their doctor.
For service inquiries or to schedule a consultation, you can ask for their contact info or tell them to call (657) 377-0776.
Keep your responses concise and readable. Use markdown bullet points if helpful.`;

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'model', content: "Hi there! I'm the Olympia AI Assistant. How can I help you today?" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  
  // For preserving chat history with the Gemini API
  const [chatSession, setChatSession] = useState(null);

  useEffect(() => {
    // Scroll to bottom on new message
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  useEffect(() => {
    if (genAI && !chatSession) {
        try {
            const model = genAI.getGenerativeModel({ 
                model: "gemini-2.5-flash",
                systemInstruction: SYSTEM_INSTRUCTION
            });
            const session = model.startChat({
                history: [
                    { role: "user", parts: [{ text: "Hello" }] },
                    { role: "model", parts: [{ text: "Hi there! I'm the Olympia AI Assistant. How can I help you today?" }] }
                ],
            });
            setChatSession(session);
        } catch (e) {
            console.error("Error initializing chat session:", e);
        }
    }
  }, [chatSession]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    if (!API_KEY) {
        // Fallback if no API key is provided
        setTimeout(() => {
            setMessages(prev => [...prev, { 
                role: 'model', 
                content: "I'm currently in 'Demo Mode' because the Gemini API key is missing. To enable my AI brain, please add `VITE_GEMINI_API_KEY=` to your `.env.local` file and restart the development server!" 
            }]);
            setIsLoading(false);
        }, 1200);
        return;
    }

    try {
        if (!chatSession) {
             throw new Error("Chat session not initialized");
        }
        const result = await chatSession.sendMessage(userMessage);
        const responseText = result.response.text();
        
        setMessages(prev => [...prev, { role: 'model', content: responseText }]);
    } catch (error) {
        console.error("Chat error:", error);
        setMessages(prev => [...prev, { 
            role: 'model', 
            content: "Sorry, I'm having trouble connecting right now. Please call us at (657) 377-0776 instead." 
        }]);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-purple-100 flex flex-col overflow-hidden animate-fadeInUp" style={{ height: '520px', maxHeight: '80vh', transformOrigin: 'bottom right' }}>
          
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-4 text-white flex justify-between items-center shadow-md">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-full shadow-inner">
                <Bot size={22} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-wide">Olympia Assistant</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <p className="text-xs text-purple-100">Usually replies instantly</p>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 p-2 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
              aria-label="Close Chat"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/80">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex gap-2 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-purple-200' : 'bg-indigo-100'}`}>
                        {msg.role === 'user' ? <User size={16} className="text-purple-700"/> : <Bot size={16} className="text-indigo-600"/>}
                    </div>
                    <div className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                        msg.role === 'user' 
                            ? 'bg-purple-600 text-white rounded-tr-sm' 
                            : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm whitespace-pre-wrap'
                    }`}>
                        {msg.content}
                    </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-2 max-w-[85%]">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Bot size={16} className="text-indigo-600"/>
                    </div>
                    <div className="py-4 px-5 rounded-2xl bg-white border border-gray-100 shadow-sm rounded-tl-sm flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                    </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all text-gray-800 placeholder-gray-400"
                disabled={isLoading}
              />
              <button 
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className="bg-purple-600 text-white p-3 rounded-xl hover:bg-purple-700 transition-colors disabled:bg-purple-300 disabled:cursor-not-allowed flex items-center justify-center shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                aria-label="Send Message"
              >
                <Send size={18} className={inputValue.trim() && !isLoading ? "translate-x-0.5 -translate-y-0.5 transition-transform" : ""} />
              </button>
            </form>
          </div>

        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-full shadow-2xl hover:scale-105 transition-all duration-300 group ${isOpen ? 'rotate-90 scale-0 opacity-0 pointer-events-none' : 'rotate-0 scale-100 opacity-100'}`}
        aria-label="Open AI Assistant"
      >
        <MessageCircle size={28} className="group-hover:animate-pulse" />
        {/* Unread badge */}
        <span className="absolute top-0 right-0 flex h-4 w-4">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
        </span>
      </button>
      
      {/* Close Button overlay */}
      {isOpen && (
         <button
         onClick={() => setIsOpen(false)}
         className="absolute bottom-0 right-0 bg-gray-800 text-white p-4 rounded-full shadow-2xl hover:scale-110 hover:bg-gray-900 transition-all duration-300 animate-fadeIn"
         aria-label="Close"
       >
         <X size={28} />
       </button>
      )}
    </div>
  );
};

export default ChatWidget;