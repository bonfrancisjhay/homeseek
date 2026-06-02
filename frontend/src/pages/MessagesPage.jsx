import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useParams  } from 'react-router-dom';
import api from '../services/api';
import { Search, Send, Home, MessageCircle } from 'lucide-react';

const BASE_URL = (import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000').replace(/\/$/, '');

export default function MessagesPage() {
  const { conversationId } = useParams();
  const [searchParams]            = useSearchParams();
  const [conversations,  setConversations]  = useState([]);
  const [activeConvo,    setActiveConvo]    = useState(null);
  const [messages,       setMessages]       = useState([]);
  const [text,           setText]           = useState('');
  const [loadingConvos,  setLoadingConvos]  = useState(true);
  const [loadingMsgs,    setLoadingMsgs]    = useState(false);
  const [sending,        setSending]        = useState(false);
  const [search,         setSearch]         = useState('');
  const bottomRef = useRef(null);
  const pollRef   = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const user  = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  const handleScroll = (e) => {
    const el = e.target;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    setIsAtBottom(atBottom);
  };

  // ── Load all conversations ──
  useEffect(() => {
    if (!token) return;
    api.get('/conversations')
      .then(res => {
        console.log("CONVERSATIONS RESPONSE:", res.data);
        setConversations(res.data);
        const listingId = searchParams.get('listing_id');
        const hostId    = searchParams.get('host_id');
        if (listingId) {
          const existing = res.data.find(c =>
            (c.user_one_id === Number(user.id) && c.user_two_id === Number(hostId)) ||
            (c.user_one_id === Number(hostId) && c.user_two_id === Number(user.id))
          );
          if (existing) {
            setActiveConvo(existing);
          } else if (hostId) {
            setActiveConvo({ listing_id: listingId, host_id: hostId, isNew: true });
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoadingConvos(false));
  }, [token]);

  useEffect(() => {
  if (!conversationId || !token) return;
  api.get(`/conversations/${conversationId}`)
    .then(res => setActiveConvo(res.data))
    .catch(console.error);
}, [conversationId]);

  // ── Load messages for active conversation ──
  useEffect(() => {
    if (!activeConvo || activeConvo.isNew) {
      setMessages([]);
      return;
    }
    setLoadingMsgs(true);
    api.get(`/conversations/${activeConvo.id}/messages`)
      .then(res => setMessages(res.data))
      .catch(console.error)
      .finally(() => setLoadingMsgs(false));

    clearInterval(pollRef.current);
    pollRef.current = setInterval(() => {
      api.get(`/conversations/${activeConvo.id}/messages`)
        .then(res => setMessages(res.data))
        .catch(() => {});
    }, 5000);

    return () => clearInterval(pollRef.current);
  }, [activeConvo?.id]);

  // ── Scroll to bottom on new messages ──
  useEffect(() => {
    if (isAtBottom) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      if (activeConvo.isNew) {
        if (!activeConvo.host_id) {
          console.error("Missing host_id", activeConvo);
          return;
        }
        const res = await api.post('/conversations', {
          host_id: activeConvo.host_id,
          listing_id: activeConvo.listing_id,
        });
        const convo = res.data;

        setConversations(prev => {
        const exists = prev.find(c => c.id === convo.id);
        return exists
          ? prev.map(c => c.id === convo.id ? convo : c)
          : [convo, ...prev];
      });
      setActiveConvo(convo);
        const msgRes = await api.post(
          `/conversations/${convo.id}/messages`,
          { body: text.trim() }
        );
        setMessages([msgRes.data]);
      } else {
        const res = await api.post(`/conversations/${activeConvo.id}/messages`, { body: text.trim() });
        setMessages(prev => [...prev, res.data]);
        setConversations(prev =>
          prev.map(c => c.id === activeConvo.id ? { ...c, last_message: text.trim() } : c)
        );
      }
      setText('');
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const filtered = conversations.filter(c =>
    (c.listing?.title || '').toLowerCase().includes(search.toLowerCase()) ||
    (c.host?.name    || '').toLowerCase().includes(search.toLowerCase())
  );

  const formatTime = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1)  return 'Just now';
    if (diffMins < 60) return `${diffMins}m`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24)  return `${diffHrs}h`;
    return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
  };

  const getInitials = (name = '') =>
    name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';

  if (!token) return (
    <div className="h-screen flex items-center justify-center">
      <p className="text-gray-400">Please log in to view messages.</p>
    </div>
  );

  return (
    // Fill the full viewport height; assumes a top navbar exists (adjust h-screen / calc as needed)
    <div className="flex flex-col" style={{ height: 'calc(100vh - 64px)' }}>

      {/* Page title bar */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white flex-shrink-0">
        <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
      </div>

      {/* Main panel — fills remaining height */}
      <div className="flex flex-1 min-h-0 bg-white">

        {/* ── Sidebar ── */}
        <div className="w-[300px] flex-shrink-0 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200 flex-shrink-0">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-full"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingConvos ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400 p-6 text-center">
                <MessageCircle className="w-8 h-8" />
                <p className="text-sm">No conversations yet</p>
              </div>
            ) : (
              filtered.map(convo => (
                <button
                  key={convo.id}
                  onClick={() => setActiveConvo(convo)}
                  className={`w-full flex items-center gap-3 px-4 py-3 border-b border-gray-100 text-left transition hover:bg-gray-50
                    ${activeConvo?.id === convo.id ? 'bg-blue-50' : ''}`}
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                    {getInitials(convo.other_user?.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-gray-900 truncate">{convo.host?.name || 'Host'}</p>
                    <p className="text-[11px] text-gray-400 truncate mt-0.5">
                      {convo.listing?.title || 'Listing'}
                    </p>
                    {convo.last_message && (
                      <p className="text-[11px] text-gray-500 truncate mt-0.5">{convo.last_message}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="text-[10px] text-gray-400">{formatTime(convo.updated_at)}</span>
                    {convo.unread_count > 0 && (
                      <span className="bg-blue-500 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                        {convo.unread_count}
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* ── Chat area ── */}
        {!activeConvo ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-400">
            <MessageCircle className="w-10 h-10" />
            <p className="text-sm">Select a conversation</p>
          </div>
        ) : (
          <div className="flex-1 flex flex-col min-w-0">
            {/* Chat header */}
            <div className="px-5 py-3.5 border-b border-gray-200 flex items-center gap-3 flex-shrink-0">
              {(() => {
                console.log('listing images:', activeConvo.listing?.images); 
                const raw = activeConvo.listing?.images?.[0];
                const src = raw
                  ? (raw.startsWith('http') ? raw : `${BASE_URL}${raw.startsWith('/') ? '' : '/'}${raw}`)
                  : null;
                return src ? (
                  <img
                    src={src}
                    alt={activeConvo.listing?.title || 'Listing'}
                    className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                    onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
                  />
                ) : null;
              })()}
              {!activeConvo.listing?.images?.[0] && (
                <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <Home className="w-5 h-5 text-blue-500" />
                </div>
              )}
              <div>
                <p className="text-[14px] font-medium text-gray-900">
                  {activeConvo.other_user?.name || 'Guest'}
                </p>
                <p className="text-[12px] text-gray-400">
                  {activeConvo.listing?.title || 'Listing'}
                  {activeConvo.listing?.location && ` · ${activeConvo.listing.location}`}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3"
              onScroll={handleScroll}
            >
              {loadingMsgs ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400">
                  <p className="text-sm">No messages yet. Say hello!</p>
                </div>
              ) : (
                messages.map(msg => {
                  const isMe = msg.sender_id === user.id;
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : ''}`}
                      style={{ maxWidth: '75%', alignSelf: isMe ? 'flex-end' : 'flex-start' }}
                    >
                      {!isMe && (
                        <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-semibold flex-shrink-0">
                          {getInitials(activeConvo.other_user?.name)}
                        </div>
                      )}
                      <div>
                        <div className={`px-3.5 py-2.5 text-[13px] leading-relaxed rounded-2xl
                          ${isMe
                            ? 'bg-blue-500 text-white rounded-br-sm'
                            : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}
                        >
                          {msg.body}
                        </div>
                        <p className={`text-[10px] text-gray-400 mt-1 ${isMe ? 'text-right' : 'text-left'}`}>
                          {formatTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-gray-200 flex items-center gap-2 flex-shrink-0">
              <input
                type="text"
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message…"
                className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-blue-400 transition"
              />
              <button
                onClick={handleSend}
                disabled={!text.trim() || sending}
                className="w-9 h-9 rounded-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition flex-shrink-0"
              >
                {sending
                  ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <Send className="w-4 h-4 text-white" />
                }
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}