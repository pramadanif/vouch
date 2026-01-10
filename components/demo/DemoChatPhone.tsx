import React, { useState, useEffect, useRef } from 'react';
import { Shield, Lock, Send, Signal, CheckCircle2 } from 'lucide-react';

// --- Types ---

export type MessageType = 'bubble' | 'vouch';

export interface ChatMessage {
    type: MessageType;
    isMe?: boolean;
    text?: string;
    time?: string;
    // For Vouch cards
    vouchStatus?: 'pending' | 'secured' | 'released';
}

export interface DemoScriptItem {
    action: 'type' | 'send' | 'wait' | 'update_last_vouch';
    actor?: 'me' | 'them'; // 'me' = currentUser
    text?: string;
    duration?: number; // ms to wait or type
    vouchStatus?: 'pending' | 'secured' | 'released';
}

interface DemoChatPhoneProps {
    role: 'seller' | 'buyer';
    contactName: string;
    contactImage: string;
    initialMessages: ChatMessage[];
    script: DemoScriptItem[];
    onComplete?: () => void;
}

// --- Sub-components ---

const ChatBubble = ({ isMe, text, time, isTyping = false, role }: { isMe: boolean; text?: string; time: string; isTyping?: boolean; role?: 'seller' | 'buyer' }) => {
    // Seller (Me) = Blue (Default Instagram)
    // Buyer (Me) = Purple
    const meColorClass = role === 'buyer'
        ? 'bg-[#8B5CF6]' // Purple-500
        : 'bg-[#3797F0]'; // Instagram Blue

    return (
        <div className={`flex w-full mb-1 ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            {/* Instagram Bubble Style */}
            <div className={`max-w-[80%] relative px-4 py-3 text-[15px] leading-snug tracking-normal shadow-sm ${isMe
                ? `${meColorClass} text-white rounded-[22px] rounded-br-sm`
                : 'bg-[#EFEFEF] text-black rounded-[22px] rounded-bl-sm'
                }`}>
                {isTyping ? (
                    <div className="flex gap-1 h-5 items-center px-1">
                        <div className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:-0.3s] ${isMe ? 'bg-white' : 'bg-gray-400'}`}></div>
                        <div className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:-0.15s] ${isMe ? 'bg-white' : 'bg-gray-400'}`}></div>
                        <div className={`w-1.5 h-1.5 rounded-full animate-bounce ${isMe ? 'bg-white' : 'bg-gray-400'}`}></div>
                    </div>
                ) : (
                    <p>{text}</p>
                )}
            </div>
        </div>
    );
};

const TypingIndicator = ({ isMe, role }: { isMe: boolean; role?: 'seller' | 'buyer' }) => {
    const meColorClass = role === 'buyer' ? 'bg-[#8B5CF6]' : 'bg-[#3797F0]';

    return (
        <div className={`flex w-full mb-1 ${isMe ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div className={`max-w-[80%] rounded-[22px] px-5 py-4 ${isMe
                ? `${meColorClass} rounded-br-sm`
                : 'bg-[#EFEFEF] rounded-bl-sm'
                }`}>
                <div className="flex gap-1.5 h-2 items-center">
                    <div className={`w-2 h-2 rounded-full animate-bounce [animation-delay:-0.3s] ${isMe ? 'bg-white/70' : 'bg-gray-400'}`}></div>
                    <div className={`w-2 h-2 rounded-full animate-bounce [animation-delay:-0.15s] ${isMe ? 'bg-white/70' : 'bg-gray-400'}`}></div>
                    <div className={`w-2 h-2 rounded-full animate-bounce ${isMe ? 'bg-white/70' : 'bg-gray-400'}`}></div>
                </div>
            </div>
        </div>
    );
};

const VouchCard = ({ status = 'pending', role }: { status?: 'pending' | 'secured' | 'released'; role?: 'seller' | 'buyer' }) => {
    const isSecured = status === 'secured' || status === 'released';
    const actionColorClass = role === 'buyer' ? 'bg-[#8B5CF6]' : 'bg-[#3797F0]';

    // Instagram Link Preview Style
    return (
        <div className="flex w-full mb-4 justify-start animate-fade-up origin-bottom-left">
            <div className="w-[85%] bg-[#EFEFEF] rounded-[22px] rounded-bl-sm overflow-hidden border border-gray-200">
                {/* Image Area */}
                <div className="h-32 bg-gray-200 relative">
                    <img
                        src="https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=500&h=300"
                        alt="Item"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 rounded-md">
                        {isSecured ? 'SECURED' : 'ESCROW LINK'}
                    </div>
                </div>

                {/* Content Area */}
                <div className="p-3">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide font-semibold mb-0.5">vouch.com</p>
                    <h4 className="text-sm font-bold text-black leading-tight mb-1">Vintage Nike Jordan - Secure Payment</h4>
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                        Pay simply and securely. Funds are held in smart contract until you receive the item.
                    </p>

                    <button className={`w-full text-center text-sm font-semibold py-2.5 rounded-lg transition-colors ${isSecured
                        ? 'bg-green-500 text-white'
                        : `${actionColorClass} text-white`
                        }`}>
                        {isSecured ? 'Payment Secured' : 'Pay Safely'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---

const DemoChatPhone: React.FC<DemoChatPhoneProps> = ({
    initialMessages,
    script,
    contactName,
    contactImage,
    role,
    onComplete
}) => {
    const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
    const [isMeTyping, setIsMeTyping] = useState(false);
    const [isThemTyping, setIsThemTyping] = useState(false);

    const scrollRef = useRef<HTMLDivElement>(null);

    // Initial scroll
    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, []);

    // Auto-scroll on new messages
    useEffect(() => {
        if (scrollRef.current) {
            setTimeout(() => {
                scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
            }, 100);
        }
    }, [messages, isMeTyping, isThemTyping]);

    // Run Script
    useEffect(() => {
        let isCancelled = false;

        const runScript = async () => {
            // Reset state
            setMessages(initialMessages);

            for (const step of script) {
                if (isCancelled) break;

                // WAIT
                if (step.action === 'wait') {
                    await new Promise(r => setTimeout(r, step.duration || 1000));
                }

                // TYPE
                else if (step.action === 'type') {
                    if (step.actor === 'me') setIsMeTyping(true);
                    else setIsThemTyping(true);

                    await new Promise(r => setTimeout(r, step.duration || 1500));

                    setIsMeTyping(false);
                    setIsThemTyping(false);
                }

                // SEND
                else if (step.action === 'send') {
                    const isMe = step.actor === 'me';
                    const timeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
                    const type: MessageType = step.text ? 'bubble' : 'vouch';

                    setMessages(prev => [...prev, {
                        type,
                        isMe,
                        text: step.text,
                        time: timeStr,
                        vouchStatus: step.vouchStatus
                    }]);
                }

                // UPDATE LAST VOUCH
                else if (step.action === 'update_last_vouch') {
                    setMessages(prev => {
                        const newMsgs = [...prev];
                        for (let i = newMsgs.length - 1; i >= 0; i--) {
                            if (newMsgs[i].type === 'vouch') {
                                newMsgs[i] = { ...newMsgs[i], vouchStatus: step.vouchStatus };
                                break;
                            }
                        }
                        return newMsgs;
                    });
                }
            }
            if (onComplete && !isCancelled) onComplete();
        };

        const timer = setTimeout(runScript, 1000);

        return () => {
            isCancelled = true;
            clearTimeout(timer);
        };
    }, []);

    // Icons
    const BackIcon = () => (
        <svg aria-label="Back" color="black" fill="black" height="24" role="img" viewBox="0 0 24 24" width="24">
            <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="2.909" x2="22.001" y1="12.004" y2="12.004"></line>
            <polyline fill="none" points="9.276 4.726 2.001 12.004 9.276 19.274" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></polyline>
        </svg>
    );

    const InfoIcon = () => (
        <svg aria-label="View Thread Details" color="black" fill="black" height="24" role="img" viewBox="0 0 24 24" width="24">
            <circle cx="12.001" cy="12.005" fill="none" r="10.5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></circle>
            <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="11.219" x2="12.782" y1="9.015" y2="9.015"></line>
            <line fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" x1="12" x2="12" y1="12.438" y2="16.928"></line>
        </svg>
    );

    const CameraIcon = () => (
        <div className="w-9 h-9 bg-[#3797F0] rounded-full flex items-center justify-center text-white shrink-0">
            <svg aria-label="Camera" fill="currentColor" height="20" role="img" viewBox="0 0 24 24" width="20">
                <path d="M12.003 16.903a4.903 4.903 0 1 1 4.903-4.903 4.903 4.903 0 0 1-4.903 4.903Zm0-7.806a2.903 2.903 0 1 0 2.903 2.903 2.903 2.903 0 0 0-2.903-2.903Z"></path>
                <path d="M22.863 6.965h-3.414l-1.077-2.673A2.324 2.324 0 0 0 16.216 3H7.788a2.326 2.326 0 0 0-2.156 1.292L4.555 6.965H1.141A1.141 1.141 0 0 0 0 8.106v11.758A1.141 1.141 0 0 0 1.141 21h21.722A1.141 1.141 0 0 0 24 19.864V8.106a1.141 1.141 0 0 0-1.137-1.141ZM12.003 18.903a6.903 6.903 0 1 1 6.903-6.903 6.903 6.903 0 0 1-6.903 6.903Z"></path>
            </svg>
        </div>
    );

    const ImagePickerIcon = () => (
        <svg aria-label="Add image" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24">
            <path d="M20 2H4a2 0 0 0-2 2v16a2 0 0 0 2 2h16a2 0 0 0 2-2V4a2 0 0 0-2-2Zm-1 15H5l4-5 3 3 4-6 3 4V17Z"></path>
        </svg>
    );

    return (
        <div className="relative w-[375px] h-[780px] bg-black rounded-[55px] shadow-2xl border-[6px] border-[#222] overflow-hidden ring-4 ring-[#111] mx-auto font-sans select-none">

            {/* Screen Content */}
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-white rounded-[48px] overflow-hidden flex flex-col">

                {/* Status Bar & Dynamic Island */}
                <div className="h-[54px] w-full flex justify-between items-start px-8 pt-4 bg-white sticky top-0 z-30">
                    <span className="text-[16px] font-semibold text-black tracking-tight mt-0.5">9:41</span>

                    {/* Dynamic Island */}
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[120px] h-[35px] bg-black rounded-[20px] z-50 flex items-center justify-center">
                        <div className="w-2 h-2 bg-neutral-800 rounded-full mr-1"></div>
                        <div className="w-1.5 h-1.5 bg-neutral-900 rounded-full"></div>
                    </div>

                    <div className="flex gap-2 items-center mt-0.5 text-black">
                        <Signal size={18} className="fill-black" />
                        <div className="w-[26px] h-[13px] border-[1.5px] border-black/30 rounded-[4px] relative">
                            <div className="absolute inset-0 bg-black m-[2px] rounded-[1px] w-full"></div>
                        </div>
                    </div>
                </div>

                {/* Header (Instagram Style) */}
                <div className="h-14 px-4 flex items-center justify-between bg-white border-b border-gray-50 z-20 relative shrink-0">
                    <div className="flex items-center gap-4">
                        <BackIcon />
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-100 ring-1 ring-gray-50">
                                <img src={contactImage} className="w-full h-full object-cover" alt="User" />
                            </div>
                            <div>
                                <p className="text-[16px] font-semibold text-black leading-none flex items-center gap-1">
                                    {contactName}
                                    {/* Verified Badge if needed */}
                                    {/* <svg aria-label="Verified" fill="#3797F0" height="12" role="img" viewBox="0 0 40 40" width="12"><path d="M19.998 3.094 14.638 0l-2.972 5.15H5.432v6.354L0 14.64 3.094 20 0 25.359l5.432 3.137v5.905h5.975L14.638 40l5.36-3.094L25.358 40l3.232-5.6h6.162v-6.01L40 25.359 36.905 20 40 14.641l-5.248-3.03v-6.46h-6.419L25.358 0l-5.36 3.094Zm7.415 11.225 2.254 2.287-11.43 11.5-6.835-6.93 2.244-2.258 4.587 4.681 9.18-9.28Z"></path></svg> */}
                                </p>
                                <p className="text-[13px] text-gray-500 leading-none mt-1">Active now</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-5 text-black items-center mr-1">
                        <svg aria-label="Audio Call" fill="none" height="26" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="26"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                        <svg aria-label="Video Call" fill="none" height="26" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="26"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect height="14" rx="2" ry="2" width="15" x="1" y="5"></rect></svg>
                    </div>
                </div>

                {/* Messages Area */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-2 space-y-1.5 bg-white scroll-smooth relative no-scrollbar">
                    {/* Initial Timestamp */}
                    <div className="flex justify-center py-5">
                        <span className="text-[12px] text-gray-400 font-medium tracking-wide">9:34 AM</span>
                    </div>

                    {messages.map((msg, i) => (
                        msg.type === 'bubble' ? (
                            <ChatBubble key={i} isMe={msg.isMe!} text={msg.text} time={msg.time!} role={role} />
                        ) : (
                            <VouchCard key={i} status={msg.vouchStatus} role={role} />
                        )
                    ))}

                    {isThemTyping && <TypingIndicator isMe={false} role={role} />}
                    {isMeTyping && <TypingIndicator isMe={true} role={role} />}

                    <div className="h-4"></div>
                </div>

                {/* Input Area (Instagram Style) */}
                <div className="px-3 pb-6 pt-3 bg-white flex items-center gap-3 z-30 shrink-0">
                    <CameraIcon />

                    <div className="flex-1 bg-[#F1F1F1] h-[48px] rounded-[24px] px-5 flex items-center justify-between transition-all active:scale-[0.99]">
                        <span className="text-[16px] text-gray-500">Message...</span>

                        <div className="flex items-center gap-4 text-gray-900">
                            {/* Mic Icon */}
                            <svg aria-label="Voice Clip" fill="currentColor" height="24" viewBox="0 0 24 24" width="24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 2.34 9 5v6c0 1.66 1.34 3 3 3z"></path><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"></path></svg>

                            {/* Image Icon */}
                            <ImagePickerIcon />

                            {/* Sticker Icon */}
                            <svg aria-label="Sticker" fill="none" height="24" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="24"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                        </div>
                    </div>
                </div>

                {/* Home Indicator */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[130px] h-[5px] bg-black/90 rounded-full z-40 mb-1"></div>
            </div>
        </div>
    );
};

export default DemoChatPhone;
