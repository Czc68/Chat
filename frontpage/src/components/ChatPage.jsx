import React, { useEffect, useState, useRef } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import axios from 'axios';

// 统一 Axios 配置
axios.defaults.baseURL = 'http://localhost:8080';
axios.defaults.withCredentials = true;

const ChatPage = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    // 在现有的 useState 下面加一行
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null); // 用于触发隐藏的文件选择框

    const stompClient = useRef(null);
    const messagesEndRef = useRef(null);

    // 核心整合 1：获取登录时存入的真实用户数据
    const currentUser = JSON.parse(localStorage.getItem('user')) || {
        id: 'guest',
        nickname: '治愈系游客',
        avatar: 'https://api.multiavatar.com/star.png'
    };

    const [contacts] = useState([
        { id: 1, name: 'XeChat 宇宙大厅', avatar: 'https://api.multiavatar.com/planet.png', lastMsg: '今天也要开心呀 ✨', time: '14:20', unread: 0, active: true },
        { id: 2, name: '图灵小助手', avatar: 'https://api.multiavatar.com/robot.png', lastMsg: '主人有什么吩咐？', time: '昨天', unread: 0, active: false },
    ]);

    // 监听鼠标位置 (用于底部小怪兽的眼神跟随)
    useEffect(() => {
        let animationFrameId;
        const handleMouseMove = (e) => {
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

    // 核心整合 2：解析后端的 Markdown 历史记录
    const loadHistory = async () => {
        try {
            const res = await axios.get('/api/record');
            const list = res.data.data?.list;
            if (list && list.length > 0) {
                // 取最新一天的文件
                const latestFile = list[list.length - 1];
                if (latestFile.file && latestFile.url) {
                    const mdRes = await axios.get(latestFile.url);
                    const mdText = mdRes.data;
                    // 简易 Markdown 解析器
                    const blocks = mdText.split('#### [').slice(1);
                    const historyMsgs = blocks.map(block => {
                        const timeEnd = block.indexOf(']');
                        const time = block.substring(0, timeEnd);
                        const headerEnd = block.indexOf('：');
                        const userStr = block.substring(timeEnd + 2, headerEnd);
                        const username = userStr.split('(')[0].replace('[系统机器人] ', '');
                        const contentMatches = block.match(/> (.*?)(?=\n|$)/g);
                        const content = contentMatches ? contentMatches.map(c => c.replace('> ', '').trim()).join('\n') : '';

                        return {
                            user: { username: username, avatar: 'https://api.multiavatar.com/default.png' },
                            message: content,
                            sendTime: time,
                            messageId: `history_${Math.random()}` // 历史记录暂时生成伪id
                        };
                    });
                    setMessages(historyMsgs);
                }
            }
        } catch (e) {
            console.error("拉取历史记录失败:", e);
        }
    };

    // WebSocket 通信逻辑
    useEffect(() => {
        // 先加载历史记录
        loadHistory();

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
                // 订阅公共聊天室
                stompClient.current.subscribe('/topic/chatRoom', (msg) => {
                    const response = JSON.parse(msg.body);
                    const receivedData = response.data; // 后端统一返回 ResponseVO

                    if (receivedData.type === 'REVOKE') {
                        // 收到撤回指令，根据 revokeMessageId 移除消息
                        setMessages(prev => prev.filter(m => m.messageId !== receivedData.revokeMessageId));
                    } else {
                        // 正常消息，正常展示
                        setMessages(prev => [...prev, { ...receivedData, id: Date.now() }]);
                    }
                });
                // 订阅系统上下线状态
                stompClient.current.subscribe('/topic/status', (msg) => {
                    const statusMsg = JSON.parse(msg.body);
                    setMessages(prev => [...prev, statusMsg]);
                });
            },
            onDisconnect: () => setIsConnected(false)
        });

        stompClient.current.activate();
        return () => stompClient.current?.deactivate();
    }, []);

    // 💥 修复 1：发送消息时，明确告诉后端这是 JSON 数据
    const sendMessage = () => {
        if (input.trim() && stompClient.current?.connected) {
            stompClient.current.publish({
                destination: '/chatRoom',
                headers: { 'content-type': 'application/json' }, // 必须加这个！
                body: JSON.stringify({ message: input, image: null })
            });
            setInput('');
            setShowEmoji(false);
        }
    };

    // 在 sendMessage 方法下面，添加这个处理图片上传的函数
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // 简单的格式校验
        if (!file.type.startsWith('image/')) {
            alert('只能上传图片文件！');
            return;
        }

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file); // 后端 @RequestParam("file") 对应这里的 'file'

        try {
            // 1. 调用后端的上传接口
            const response = await axios.post('/api/upload/image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.code === 200 || response.data.code === 0) {
                const imageUrl = response.data.path; // 获取后端返回的图片路径

                // 2. 通过 WebSocket 发送包含图片的 STOMP 消息
                if (stompClient.current?.connected) {
                    stompClient.current.publish({
                        destination: '/chatRoom',
                        body: JSON.stringify({ message: '', image: imageUrl })
                    });
                }
            } else {
                alert('图片上传失败：' + response.data.desc);
            }
        } catch (error) {
            console.error("上传异常", error);
            alert('网络异常，图片上传失败');
        } finally {
            setIsUploading(false);
            e.target.value = ''; // 清空 input，允许重复上传同一张图片
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };
    // 💥 修复 2：撤回消息也一样需要加 Header
    const recallMessage = (messageId) => {
        if (stompClient.current?.connected) {
            stompClient.current.publish({
                destination: '/chatRoom/revoke',
                headers: { 'content-type': 'application/json' }, // 必须加这个！
                body: JSON.stringify({ messageId: messageId })
            });
        }
    };

    // 计算小怪兽眼球偏移量
    const maxOffset = 6;
    const eyeOffsetX = Math.max(-maxOffset, Math.min(maxOffset, (mousePos.x - window.innerWidth / 4) / 40));
    const eyeOffsetY = Math.max(-maxOffset, Math.min(maxOffset, (mousePos.y - window.innerHeight) / 40));

    return (
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

            <aside className="w-80 h-full flex flex-col bg-white/60 backdrop-blur-2xl border-r border-slate-100/60 shadow-[4px_0_24px_rgba(0,0,0,0.01)] relative z-20 shrink-0">
                <div className="px-6 pt-8 pb-5">
                    <div className="flex items-center gap-4 group cursor-pointer">
                        <div className="relative">
                            <img src={currentUser.avatar || 'https://api.multiavatar.com/default.png'} alt="avatar" className="w-14 h-14 rounded-[1.2rem] object-cover bg-slate-50 shadow-sm transition-transform group-hover:scale-105" />
                            <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-[3px] border-white ${isConnected ? 'bg-[#34D399]' : 'bg-slate-300'}`}></span>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <h2 className="font-extrabold text-[1.1rem] text-slate-800 truncate">{currentUser.nickname}</h2>
                            <p className="text-[0.75rem] font-medium text-slate-400 truncate mt-0.5">{isConnected ? '✨ 开启治愈的一天' : '💤 正在休眠'}</p>
                        </div>
                    </div>
                </div>

                <div className="px-6 pb-4">
                    <div className="relative">
                        <svg className="absolute left-3.5 top-3 w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        <input type="text" placeholder="搜索会话..." className="w-full bg-[#F8FAFC] text-sm text-slate-700 placeholder-slate-400 rounded-[1.2rem] pl-10 pr-4 py-2.5 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-purple-100 focus:shadow-[0_4px_12px_rgba(167,139,250,0.1)]" />
                    </div>
                </div>

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

                {/* 几何小怪兽保持原样 */}
                <div className="absolute bottom-4 left-6 pointer-events-none opacity-85 z-0 flex items-end">
                    <div className="relative w-16 h-14 bg-[#FDE047] rounded-t-[2rem] rounded-bl-[2rem] rounded-br-md shadow-[0_4px_12px_rgba(253,224,71,0.3)] flex justify-center items-center pt-2">
                        <div className="flex gap-1.5">
                            <div className="w-4 h-4 bg-white rounded-full flex justify-center items-center overflow-hidden shadow-inner">
                                <div className="w-2 h-2 bg-[#1E1E1E] rounded-full transition-transform duration-75 ease-out" style={{ transform: `translate(${eyeOffsetX}px, ${eyeOffsetY}px)` }}></div>
                            </div>
                            <div className="w-3.5 h-3.5 bg-white rounded-full flex justify-center items-center overflow-hidden shadow-inner mt-0.5">
                                <div className="w-1.5 h-1.5 bg-[#1E1E1E] rounded-full transition-transform duration-75 ease-out" style={{ transform: `translate(${eyeOffsetX}px, ${eyeOffsetY}px)` }}></div>
                            </div>
                        </div>
                        <div className="absolute top-7 left-1.5 w-2.5 h-1.5 bg-[#F87171] opacity-40 rounded-full blur-[1px]"></div>
                        <div className="absolute top-7 right-2 w-2.5 h-1.5 bg-[#F87171] opacity-40 rounded-full blur-[1px]"></div>
                    </div>
                </div>
            </aside>

            <main className="flex-1 flex flex-col relative min-w-0 bg-transparent">
                <header className="h-20 flex items-center justify-between px-8 bg-white/40 backdrop-blur-xl border-b border-slate-100/60 shrink-0 z-10">
                    <div>
                        <h1 className="text-[1.2rem] font-extrabold text-slate-800 tracking-tight">XeChat 宇宙大厅</h1>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#A78BFA]"></span>
                            <span className="text-[0.75rem] font-medium text-slate-400">1,204 位探险家</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="w-9 h-9 flex items-center justify-center rounded-full bg-white text-slate-400 hover:text-[#8B5CF6] hover:shadow-[0_4px_12px_rgba(139,92,246,0.1)] transition-all">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
                    <div className="space-y-6 max-w-4xl mx-auto">
                        {messages.map((m, i) => {
                            const isSystem = m.type === 'SYSTEM' || !m.user;
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
                                            {/* 对方气泡 */}
                                            {!isMe && (
                                                <div className="px-5 py-3.5 bg-white border border-slate-100 shadow-[0_4px_16px_rgba(0,0,0,0.02)] text-slate-700 text-[0.95rem] font-medium rounded-[1.5rem] rounded-tl-[0.4rem] leading-relaxed">
                                                    {m.message}
                                                </div>
                                            )}

                                            {/* 自己气泡与撤回按钮 */}
                                            {isMe && (
                                                <button
                                                    onClick={() => recallMessage(m.messageId)}
                                                    className="opacity-0 group-hover:opacity-100 text-[10px] text-slate-400 hover:text-red-500 transition-all px-2"
                                                >
                                                    撤回
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} className="h-4" />
                    </div>
                </div>

                <div className="px-8 pb-8 pt-2 shrink-0 relative">
                    {showEmoji && (
                        <div className="absolute bottom-full left-8 mb-4 p-4 rounded-[1.5rem] bg-white shadow-[0_10px_40px_rgba(0,0,0,0.08)] border border-slate-100 grid grid-cols-6 gap-2 z-50">
                            {['😀','😂','🥰','😎','🥺','✨','🎉','🔥','👀','💡','👍','🌸'].map(emoji => (
                                <button key={emoji} onClick={() => {setInput(prev => prev + emoji); setShowEmoji(false);}} className="text-2xl hover:scale-110 hover:bg-slate-50 p-1.5 rounded-xl transition-all">{emoji}</button>
                            ))}
                        </div>
                    )}

                    <div className="bg-white rounded-[1.8rem] p-2.5 flex flex-col shadow-[0_8px_30px_rgba(0,0,0,0.03)] border border-slate-100 transition-all duration-300 focus-within:shadow-[0_12px_40px_rgba(167,139,250,0.12)] focus-within:border-purple-100">
                        <textarea
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="分享你的瞬间..."
                            className="w-full bg-transparent border-none px-4 py-3 text-[0.95rem] text-slate-700 font-medium focus:outline-none resize-none max-h-32 min-h-[50px] custom-scrollbar placeholder-slate-300"
                            rows="1"
                        />
                        <div className="flex justify-between items-center px-3 pt-2 pb-1">
                            <div className="flex gap-1.5">
                                <button onClick={() => setShowEmoji(!showEmoji)} className="p-2 rounded-full text-slate-400 hover:bg-[#F5F3FF] hover:text-[#8B5CF6] transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                </button>
                                {/* ====== 开始：真实的图片上传功能 ====== */}
                                <input
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className={`p-2 rounded-full transition-colors ${isUploading ? 'opacity-50 cursor-wait' : 'text-slate-400 hover:bg-[#F5F3FF] hover:text-[#8B5CF6]'}`}
                                    title="发送图片"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                </button>
                                {/* ====== 结束：真实的图片上传功能 ====== */}
                            </div>

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