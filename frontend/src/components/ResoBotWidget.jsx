import React, { useState, useRef, useEffect } from 'react';
import { aiAPI } from '../services/api';
import { MessageSquare, X, Send, Bot, FileText, Video, Loader, BookOpen, ExternalLink, Folder } from 'lucide-react';

export default function ResoBotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, type: 'bot', text: 'Hello Associate! 👋 I am ResoBot. Ask me about SOPs, Training Modules, or Corporate Policies.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), type: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await aiAPI.query(userMsg.text);
      
      const botMsg = {
        id: Date.now() + 1,
        type: 'bot',
        text: response.data.reply,
        results: response.data.results 
      };
      setMessages(prev => [...prev, botMsg]);

    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now() + 1, type: 'bot', text: 'I encountered a connection error. Please try again later.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Chat Window */}
      {isOpen && (
        <div className="bg-white/90 backdrop-blur-xl border border-white/50 w-[380px] h-[500px] rounded-2xl shadow-2xl flex flex-col mb-4 overflow-hidden animate-fade-in origin-bottom-right">
          
          {/* Header */}
          <div className="bg-reso-royal text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <Bot size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm">ResoBot AI</h3>
                <p className="text-xs text-purple-200">Corporate Knowledge Assistant</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded transition">
              <X size={18} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-reso-pale/30">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                  msg.type === 'user' 
                    ? 'bg-reso-royal text-white rounded-tr-none' 
                    : 'bg-white text-reso-deep shadow-sm border border-white/60 rounded-tl-none'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  
                  {/* --- RENDER RESULTS --- */}
                  {msg.results && msg.results.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {msg.results.map((res, idx) => (
                        // If it's a Module, link to the Module Page. If it's an Asset, link to the file.
                        res.kind === 'MODULE' ? (
                          <a 
                            key={idx} 
                            href={`/module/${res.id}`}
                            className="bg-reso-pale/50 p-2 rounded-lg border border-reso-peach/50 hover:bg-white transition cursor-pointer flex items-center gap-3 group"
                          >
                             <div className="bg-white p-2 rounded-full shrink-0 group-hover:bg-purple-100 transition">
                                <BookOpen size={14} className="text-reso-royal"/>
                             </div>
                             <div>
                               <p className="font-semibold text-xs truncate text-reso-deep">{res.title}</p>
                               <p className="text-[10px] text-reso-mauve uppercase tracking-wider">Training Module</p>
                             </div>
                          </a>
                        ) : (
                          <a 
                            key={idx}
                            href={`http://localhost:5000/${res.file_path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white p-2.5 rounded-lg border border-gray-200 hover:border-reso-royal hover:shadow-md transition cursor-pointer flex items-start gap-3 group"
                          >
                            <div className="bg-reso-pale p-2 rounded-lg shrink-0 group-hover:bg-reso-royal group-hover:text-white transition">
                              {res.file_type === 'VIDEO' ? <Video size={16} /> : <FileText size={16} />}
                            </div>
                            <div className="overflow-hidden w-full">
                              <p className="font-bold text-xs truncate text-reso-deep group-hover:text-reso-royal transition">{res.title}</p>
                              
                              {/* PATH CONTEXT: "Found in: Java Full Stack..." */}
                              {res.module_title && (
                                <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-500">
                                  <Folder size={10} />
                                  <span className="truncate">in: {res.module_title}</span>
                                </div>
                              )}
                              
                              <div className="flex items-center gap-1 mt-1 text-[10px] text-reso-mauve">
                                <ExternalLink size={10} />
                                <span>Click to open</span>
                              </div>
                            </div>
                          </a>
                        )
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm flex gap-2 items-center">
                  <Loader size={14} className="animate-spin text-reso-royal" />
                  <span className="text-xs text-reso-mauve">Scanning Data Warehouse...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-100 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about a topic..."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-reso-royal/20"
            />
            <button type="submit" disabled={!input.trim()} className="bg-reso-royal text-white p-2 rounded-xl hover:bg-reso-dark transition disabled:opacity-50">
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 bg-reso-royal text-white rounded-full shadow-lg hover:shadow-reso-royal/40 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center relative group"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </button>
    </div>
  );
}