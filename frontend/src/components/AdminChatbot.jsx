import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Bot, Send, X, MessageSquare, Terminal, ChevronDown, Sparkles } from 'lucide-react';

const AdminChatbot = ({ token, onAction }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState(() => {
        const saved = localStorage.getItem('admin_ai_chat');
        return saved ? JSON.parse(saved) : [
            { role: 'ai', text: 'ADMIN-AI online. System integrity nominal. How can I assist you, Root Admin?', timestamp: new Date().toLocaleTimeString() }
        ];
    });
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [context, setContext] = useState(() => {
        const saved = localStorage.getItem('admin_ai_context');
        return saved ? JSON.parse(saved) : {};
    });
    const [suggestions, setSuggestions] = useState([]);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
        localStorage.setItem('admin_ai_chat', JSON.stringify(messages));
    }, [messages, isTyping]);

    useEffect(() => {
        localStorage.setItem('admin_ai_context', JSON.stringify(context));
    }, [context]);

    const handleSendMessage = async (e, directMsg = null) => {
        if (e) e.preventDefault();
        const userMsg = directMsg || input.trim();
        if (!userMsg) return;

        if (!directMsg) setInput('');
        setMessages(prev => [...prev, { role: 'user', text: userMsg, timestamp: new Date().toLocaleTimeString() }]);
        setIsTyping(true);
        setSuggestions([]);

        try {
            const res = await axios.post('http://127.0.0.1:8000/api/admin/chat/', 
                { message: userMsg, context: context },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const { reply, action, payload, context: newContext, suggestions: newSuggestions } = res.data;
            
            setTimeout(() => {
                setMessages(prev => [...prev, { 
                    role: 'ai', 
                    text: reply, 
                    timestamp: new Date().toLocaleTimeString(),
                    isAction: !!action && action !== 'NONE'
                }]);
                setIsTyping(false);
                if (newContext) setContext(newContext);
                if (newSuggestions) setSuggestions(newSuggestions);

                if (action === 'CLEAR_CHAT') {
                    setTimeout(() => clearChat(), 1000);
                } else if (action && action !== 'NONE' && onAction) {
                    onAction(action, payload);
                }
            }, 600);

        } catch (err) {
            setMessages(prev => [...prev, { role: 'ai', text: "Error: Failed to uplink with central node. Check server status.", timestamp: new Date().toLocaleTimeString() }]);
            setIsTyping(false);
        }
    };

    const clearChat = () => {
        const initial = [{ role: 'ai', text: 'Buffer purged. System reset. Ready for new input.', timestamp: new Date().toLocaleTimeString() }];
        setMessages(initial);
        setContext({});
        setSuggestions([]);
        localStorage.removeItem('admin_ai_chat');
        localStorage.removeItem('admin_ai_context');
    };

    return (
        <div className="fixed bottom-8 right-8 z-[1000] font-sans">
            {/* CHAT BUBBLE */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`relative p-5 rounded-full shadow-2xl transition-all duration-500 transform hover:scale-110 active:scale-95 ${isOpen ? 'bg-red-500 rotate-90 scale-0' : 'bg-blue-600 hover:bg-blue-500'}`}
            >
                <Bot className="text-white" size={28} />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#020617] animate-pulse" />
            </button>

            {/* CHAT WINDOW */}
            <div className={`absolute bottom-0 right-0 w-[420px] h-[650px] bg-[#0f172a] border border-white/10 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden transition-all duration-500 origin-bottom-right ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-0 opacity-0 translate-y-20 pointer-events-none'}`}>
                
                {/* HEADER */}
                <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/10 p-2 rounded-xl backdrop-blur-md">
                            <Terminal size={18} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-white font-black text-sm tracking-tighter uppercase italic">ADMIN-AI <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full ml-2 not-italic tracking-normal">Online</span></h3>
                            <p className="text-blue-100 text-[10px] font-bold uppercase tracking-widest">Autonomous Assistant Node</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={clearChat} title="Clear Buffer" className="text-white/40 hover:text-white transition-all">
                            <ChevronDown size={20} className="rotate-180" />
                        </button>
                        <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white transition-all">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* MESSAGES */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-hide">
                    {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                            <div className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${m.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-[#1e293b] border border-white/5 text-slate-300 rounded-tl-none'}`}>
                                {m.isAction && <div className="flex items-center gap-1.5 text-[9px] font-bold text-emerald-400 uppercase tracking-widest mb-1.5"><Sparkles size={10}/> Action Executed</div>}
                                <p className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: m.text.replace(/\*\*(.*?)\*\*/g, '<b class="text-white">$1</b>') }} />
                                <span className={`text-[9px] mt-2 block font-medium uppercase tracking-tighter ${m.role === 'user' ? 'text-blue-200' : 'text-slate-500'}`}>{m.timestamp}</span>
                            </div>
                        </div>
                    ))}
                    {isTyping && (
                        <div className="flex justify-start">
                            <div className="bg-[#1e293b] border border-white/5 rounded-2xl rounded-tl-none p-4 flex gap-1">
                                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" />
                            </div>
                        </div>
                    )}
                </div>

                {/* SUGGESTIONS */}
                {suggestions.length > 0 && (
                    <div className="px-6 py-2 flex flex-wrap gap-2 animate-in fade-in slide-in-from-bottom-2">
                        {suggestions.map((s, i) => (
                            <button 
                                key={i} 
                                onClick={() => handleSendMessage(null, s)}
                                className="text-[10px] font-bold text-blue-400 bg-blue-400/10 border border-blue-400/20 px-3 py-1.5 rounded-full hover:bg-blue-400 hover:text-white transition-all transform hover:-translate-y-0.5"
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                )}

                {/* INPUT */}
                <form onSubmit={handleSendMessage} className="p-4 bg-[#0b1120] border-t border-white/5">
                    <div className="relative">
                        <input 
                            type="text" 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask a follow-up... (e.g. 'What is his SR?')"
                            className="w-full bg-[#1e293b]/50 border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-sm text-white focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600"
                        />
                        <button type="submit" className="absolute right-2 top-2 p-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95">
                            <Send size={18} />
                        </button>
                    </div>
                    <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-3 text-center opacity-50">Authorized Personnel Only • Node Context Aware</p>
                </form>
            </div>
        </div>
    );
};

export default AdminChatbot;
