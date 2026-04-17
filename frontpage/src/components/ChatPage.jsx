import React, { useEffect, useState, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const ChatPage = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    const stompClient = useRef(null);
    const messagesEndRef = useRef(null);

    // 当前登录用户
    const currentUser = JSON.parse(localStorage.getItem('user')) || {
        nickname: '治愈系新星',
        avatar: 'https://api.multiavatar.com/star.png'
    };

    // 模拟联系人数据
    const [contacts] = useState([
        { id: 1, name: 'XeChat 治愈星球', avatar: 'https://api.multiavatar.com/planet.png', lastMsg: '今天也要开心呀 ✨', time: '14:20', unread: 0, active: true },
        { id: 2, name: '图灵小助手', avatar: 'https://api.multiavatar.com/robot.png', lastMsg: '主人有什么吩咐？', time: '昨天', unread: 3, active: false },
    ]);

    // 监听鼠标位置 (用于底部小怪兽的眼神跟随)
    useEffect(() => {
        let animationFrameId;
        const handleMouseMove = (e) => {
            // 使用 requestAnimationFrame 保证动画极度顺滑且不掉帧
            animationFrameId = requestAnimationFrame(() => {
                setMousePos({ x: e.clientX, y: e.clientY });
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    // 自动滚动到底部
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // WebSocket 通信逻辑
    useEffect(() => {
        const socket = new SockJS('http://localhost:8080/xechat');
        stompClient.current = new Client({
            webSocketFactory: () => socket,
            connectHeaders: {
                username: currentUser.nickname,
                avatar: currentUser.avatar,
                address: '治愈星球'
            },
            onConnect: () => {
                setIsConnected(true);
                stompClient.current.subscribe('/topic/chatRoom', (msg) => {
                    setMessages(prev => [...prev, { ...JSON.parse(msg.body), id: Date.now() }]);
                });
                stompClient.current.subscribe('/topic/status', (msg) => {
                    setMessages(prev => [...prev, JSON.parse(msg.body)]);
                });
            },
            onDisconnect: () => setIsConnected(false)
        });

        stompClient.current.activate();
        return () => stompClient.current?.deactivate();
    }, []);

    const sendMessage = () => {
        if (input.trim() && stompClient.current?.connected) {
            stompClient.current.publish({
                destination: '/chatRoom',
                body: JSON.stringify({ message: input, image: null })
            });
            setInput('');
            setShowEmoji(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // 计算小怪兽眼球偏移量 (限制在一定范围内)
    const maxOffset = 6;
    const eyeOffsetX = Math.max(-maxOffset, Math.min(maxOffset, (mousePos.x - window.innerWidth / 4) / 40));
    const eyeOffsetY = Math.max(-maxOffset, Math.min(maxOffset, (mousePos.y - window.innerHeight) / 40));

    return (
        // 根容器：严格限定 100vh，无溢出。底色为纯白，加入极淡的柔紫渐变
        <div className="flex h-screen w-full overflow-hidden bg-white font-sans selection:bg-purple-200 text-slate-800 relative"
             style={{ backgroundImage: 'radial-gradient(circle at 80% -20%, #F5F3FF 0%, #FFFFFF 50%, #FFF8F1 100%)' }}>

            <style>
                {`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
                .custom-scrollbar:hover::-webkit-scrollbar-thumb { background: #CBD5E1; }
                .msg-enter { animation: soft-pop 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                @keyframes soft-pop {
                    0% { opacity: 0; transform: translateY(8px) scale(0.98); }
                    100% { opacity: 1; transform: translateY(0) scale(1); }
                }
                `}
            </style>

            {/* ====== 左侧：会话侧边栏 ====== */}
            <aside className="w-80 h-full flex flex-col bg-white/60 backdrop-blur-2xl border-r border-slate-100/60 shadow-[4px_0_24px_rgba(0,0,0,0.01)] relative z-20 shrink-0">

                {/* 1. 顶部：用户个人信息卡片 */}
                <div className="px-6 pt-8 pb-5">
                    <div className="flex items-center gap-4 group cursor-pointer">
                        <div className="relative">
                            <img src={currentUser.avatar} alt="avatar" className="w-14 h-14 rounded-[1.2rem] object-cover bg-slate-50 shadow-sm transition-transform group-hover:scale-105" />
                            <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-[3px] border-white ${isConnected ? 'bg-[#34D399]' : 'bg-slate-300'}`}></span>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <h2 className="font-extrabold text-[1.1rem] text-slate-800 truncate">{currentUser.nickname}</h2>
                            <p className="text-[0.75rem] font-medium text-slate-400 truncate mt-0.5">{isConnected ? '✨ 开启治愈的一天' : '💤 正在休眠'}</p>
                        </div>
                    </div>
                </div>

                {/* 2. 圆角搜索框 */}
                <div className="px-6 pb-4">
                    <div className="relative">
                        <svg className="absolute left-3.5 top-3 w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        <input type="text" placeholder="搜索会话..." className="w-full bg-[#F8FAFC] text-sm text-slate-700 placeholder-slate-400 rounded-[1.2rem] pl-10 pr-4 py-2.5 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-purple-100 focus:shadow-[0_4px_12px_rgba(167,139,250,0.1)]" />
                    </div>
                </div>

                {/* 3. 会话列表 */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-28 relative z-10">
                    {contacts.map(contact => (
                        <div key={contact.id} className={`flex items-center p-3 mb-1.5 rounded-[1.2rem] cursor-pointer transition-all duration-300 group ${contact.active ? 'bg-[#F5F3FF] shadow-[0_2px_10px_rgba(167,139,250,0.06)]' : 'hover:bg-slate-50'}`}>
                            <div className="relative shrink-0">
                                <img src={contact.avatar} alt="avatar" className="w-12 h-12 rounded-[1rem] bg-white shadow-sm" />
                                {contact.unread > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-[#FB923C] text-white text-[10px] font-bold px-1.5 py-0.5 min-w-[20px] text-center rounded-full border-2 border-white shadow-sm">
                                        {contact.unread}
                                    </span>
                                )}
                            </div>
                            <div className="ml-3 flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-0.5">
                                    <h3 className={`text-[0.9rem] truncate ${contact.active ? 'font-bold text-[#8B5CF6]' : 'font-semibold text-slate-700 group-hover:text-slate-900'}`}>{contact.name}</h3>
                                    <span className="text-[0.7rem] font-medium text-slate-400 shrink-0 ml-2">{contact.time}</span>
                                </div>
                                <p className={`text-[0.75rem] truncate ${contact.active ? 'text-[#A78BFA]' : 'text-slate-400'}`}>{contact.lastMsg}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* 4. 左下角：登录页同款软萌几何小怪兽 (完美融入，不挡内容) */}
                <div className="absolute bottom-4 left-6 pointer-events-none opacity-85 z-0 flex items-end">
                    {/* 小怪兽身体 (明黄色极简色块) */}
                    <div className="relative w-16 h-14 bg-[#FDE047] rounded-t-[2rem] rounded-bl-[2rem] rounded-br-md shadow-[0_4px_12px_rgba(253,224,71,0.3)] flex justify-center items-center pt-2">
                        {/* 眼睛区域 */}
                        <div className="flex gap-1.5">
                            {/* 左眼 */}
                            <div className="w-4 h-4 bg-white rounded-full flex justify-center items-center overflow-hidden shadow-inner">
                                <div className="w-2 h-2 bg-[#1E1E1E] rounded-full transition-transform duration-75 ease-out" style={{ transform: `translate(${eyeOffsetX}px, ${eyeOffsetY}px)` }}></div>
                            </div>
                            {/* 右眼 (稍微小一点显得萌) */}
                            <div className="w-3.5 h-3.5 bg-white rounded-full flex justify-center items-center overflow-hidden shadow-inner mt-0.5">
                                <div className="w-1.5 h-1.5 bg-[#1E1E1E] rounded-full transition-transform duration-75 ease-out" style={{ transform: `translate(${eyeOffsetX}px, ${eyeOffsetY}px)` }}></div>
                            </div>
                        </div>
                        {/* 腮红 */}
                        <div className="absolute top-7 left-1.5 w-2.5 h-1.5 bg-[#F87171] opacity-40 rounded-full blur-[1px]"></div>
                        <div className="absolute top-7 right-2 w-2.5 h-1.5 bg-[#F87171] opacity-40 rounded-full blur-[1px]"></div>
                    </div>
                </div>
            </aside>

            {/* ====== 右侧：主聊天区 ====== */}
            <main className="flex-1 flex flex-col relative min-w-0 bg-transparent">

                {/* 1. 顶部：无遮挡完整标题栏 */}
                <header className="h-20 flex items-center justify-between px-8 bg-white/40 backdrop-blur-xl border-b border-slate-100/60 shrink-0 z-10">
                    <div>
                        <h1 className="text-[1.2rem] font-extrabold text-slate-800 tracking-tight">XeChat 宇宙大厅</h1>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#A78BFA]"></span>
                            <span className="text-[0.75rem] font-medium text-slate-400">1,204 位探险家</span>
                        </div>
                    </div>
                    {/* 功能按钮 */}
                    <div className="flex items-center gap-3">
                        <button className="w-9 h-9 flex items-center justify-center rounded-full bg-white text-slate-400 hover:text-[#8B5CF6] hover:shadow-[0_4px_12px_rgba(139,92,246,0.1)] transition-all">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </button>
                        <button className="w-9 h-9 flex items-center justify-center rounded-full bg-white text-slate-400 hover:text-[#8B5CF6] hover:shadow-[0_4px_12px_rgba(139,92,246,0.1)] transition-all">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path></svg>
                        </button>
                    </div>
                </header>

                {/* 2. 中间：消息流区域 */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                    <div className="space-y-6 max-w-4xl mx-auto">

                        {/* 时间戳 */}
                        <div className="flex justify-center">
                            <span className="px-4 py-1.5 bg-[#F8FAFC] text-[0.7rem] font-bold text-slate-400 rounded-full tracking-wider">TODAY 14:00</span>
                        </div>

                        {messages.map((m, i) => {
                            const isSystem = !m.user;
                            const isMe = m.user?.username === currentUser.nickname;

                            if (isSystem) return (
                                <div key={i} className="flex justify-center msg-enter">
                                    <span className="px-4 py-1.5 bg-[#F8FAFC] text-[0.7rem] font-bold text-slate-400 rounded-full">{m.message}</span>
                                </div>
                            );

                            return (
                                <div key={i} className={`flex gap-3 msg-enter group ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <img src={m.user?.avatar || 'https://api.multiavatar.com/default.png'} alt="avatar" className="w-10 h-10 rounded-[1rem] bg-white shadow-sm shrink-0" />

                                    <div className={`flex flex-col max-w-[65%] ${isMe ? 'items-end' : 'items-start'}`}>
                                        <div className="flex items-baseline gap-2 mb-1.5 mx-1">
                                            <span className="text-[0.75rem] font-bold text-slate-500">{m.user?.username}</span>
                                        </div>

                                        <div className="flex items-end gap-2">
                                            {/* 对方消息气泡 (干净白底+浅灰边) */}
                                            {!isMe && (
                                                <div className="px-5 py-3.5 bg-white border border-slate-100 shadow-[0_4px_16px_rgba(0,0,0,0.02)] text-slate-700 text-[0.95rem] font-medium rounded-[1.5rem] rounded-tl-[0.4rem] leading-relaxed">
                                                    {m.message}
                                                </div>
                                            )}

                                            {/* 自己消息气泡 (品牌紫渐变+低饱和阴影) */}
                                            {isMe && (
                                                <div className="px-5 py-3.5 bg-gradient-to-br from-[#A78BFA] to-[#C084FC] text-white text-[0.95rem] font-medium rounded-[1.5rem] rounded-tr-[0.4rem] shadow-[0_6px_20px_rgba(167,139,250,0.25)] leading-relaxed relative">
                                                    {m.message}
                                                    {/* 已读状态：小巧精致 */}
                                                    <span className="absolute -bottom-5 right-2 text-[0.65rem] font-bold text-[#8B5CF6] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>已读
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} className="h-4" />
                    </div>
                </div>

                {/* 3. 底部：大圆角富文本输入栏 */}
                <div className="px-8 pb-8 pt-2 shrink-0 relative">
                    {/* 表情面板浮层 */}
                    {showEmoji && (
                        <div className="absolute bottom-full left-8 mb-4 p-4 rounded-[1.5rem] bg-white shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-slate-100 grid grid-cols-6 gap-2 z-50">
                            {['😀','😂','🥰','😎','🥺','✨','🎉','🔥','👀','💡','👍','🌸'].map(emoji => (
                                <button key={emoji} onClick={() => {setInput(prev => prev + emoji); setShowEmoji(false);}} className="text-2xl hover:scale-110 hover:bg-slate-50 p-1.5 rounded-xl transition-all">{emoji}</button>
                            ))}
                        </div>
                    )}

                    <div className="bg-white rounded-[1.8rem] p-2.5 flex flex-col shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-slate-100 transition-all duration-300 focus-within:shadow-[0_12px_40px_rgba(167,139,250,0.12)] focus-within:border-purple-100">

                        {/* 多行输入框 */}
                        <textarea
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="分享你的瞬间..."
                            className="w-full bg-transparent border-none px-4 py-3 text-[0.95rem] text-slate-700 font-medium focus:outline-none resize-none max-h-32 min-h-[50px] custom-scrollbar placeholder-slate-300"
                            rows="1"
                        />

                        {/* 工具栏与发送按钮 */}
                        <div className="flex justify-between items-center px-3 pt-2 pb-1">
                            {/* 左侧附件按钮组 (使用圆润的图标和浅色悬停) */}
                            <div className="flex gap-1.5">
                                <button onClick={() => setShowEmoji(!showEmoji)} className="p-2 rounded-full text-slate-400 hover:bg-[#F5F3FF] hover:text-[#8B5CF6] transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                </button>
                                <button className="p-2 rounded-full text-slate-400 hover:bg-[#F5F3FF] hover:text-[#8B5CF6] transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                </button>
                            </div>

                            {/* 黑金质感圆润发送按钮 */}
                            <button
                                onClick={sendMessage}
                                disabled={!input.trim()}
                                className="bg-[#1E1E1E] text-white px-7 py-2.5 rounded-full text-[0.85rem] font-bold tracking-wide hover:bg-[#8B5CF6] hover:shadow-[0_6px_20px_rgba(139,92,246,0.3)] hover:-translate-y-0.5 active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed disabled:hover:bg-[#1E1E1E] disabled:hover:shadow-none disabled:hover:translate-y-0 transition-all duration-300 flex items-center gap-2"
                            >
                                <span>发送</span>
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ChatPage;