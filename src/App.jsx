import React, { useState, useEffect, useRef } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, LogOut, Lock, Heart, Music, Quote, 
  Plus, Trash2, Settings as SettingsIcon, LayoutDashboard, Save, 
  Image as ImageIcon, Pin, PinOff, Search, Eye, ArrowLeft, X
} from 'lucide-react';

/* ================= LANDING PAGE ================= */
const LandingPage = () => {
  const [pinnedQuotes, setPinnedQuotes] = useState([]);
  const [settings, setSettings] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    fetchContent();
    const handleInteraction = () => {
      if (audioRef.current && !isPlaying) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
      window.removeEventListener('click', handleInteraction);
    };
    window.addEventListener('click', handleInteraction);
    return () => window.removeEventListener('click', handleInteraction);
  }, []);

  const fetchContent = async () => {
    const { data: q } = await supabase
      .from('quotes')
      .select('*')
      .eq('is_pinned', true)
      .order('created_at', { ascending: false })
      .limit(5);

    const { data: s } = await supabase.from('settings').select('*').single();
    setPinnedQuotes(q || []);
    setSettings(s);
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    isPlaying ? audioRef.current.pause() : audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="min-h-screen bg-[#E9E4D9] p-4 md:p-12 font-serif">
      <header className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8 mb-16 mt-4">
        <div className="relative">
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-black overflow-hidden bg-pink-300">
            <img src={settings?.profile_url || "https://via.placeholder.com/150"} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all" />
          </div>
          <Heart className="absolute -bottom-1 -right-1 bg-yellow-300 border-2 border-black p-2 rounded-full animate-pulse" size={40} fill="red" />
        </div>

        <div className="flex-1 text-center md:text-left">
          <h1 className="text-[12vw] md:text-[80px] font-black italic uppercase tracking-tighter leading-[0.8]">flyhighlana.</h1>
          <div className="h-1 w-full bg-black my-2" />
          <p className="text-[10px] font-mono uppercase tracking-[0.5em] opacity-50 italic">Pinned Memories & Digital Journal</p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
        <AnimatePresence>
          {pinnedQuotes.map((q, i) => (
            <motion.div
              key={q.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white border-4 border-black shadow-lg flex flex-col relative"
            >
              {q.image_url && (
                <div className="h-48 border-b-4 border-black overflow-hidden">
                  <img src={q.image_url} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all" />
                </div>
              )}
              <div className="p-6">
                <Pin size={14} className="absolute top-3 right-3 text-pink-500" />
                <p className="text-xl font-bold italic mb-4">"{q.text}"</p>
                <div className="border-t border-black pt-2 flex justify-between text-[9px] font-mono uppercase opacity-40">
                  <span>#{pinnedQuotes.length - i}</span>
                  <span>{new Date(q.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </motion.div>
          ))}

          <Link to="/gallery">
            <div className="h-full min-h-[220px] bg-black text-white border-4 border-black flex flex-col items-center justify-center p-6 hover:bg-zinc-800 transition">
              <Plus size={48} />
              <p className="font-black uppercase italic text-xl">Explore All Archive</p>
            </div>
          </Link>
        </AnimatePresence>
      </main>

      <audio ref={audioRef} src={settings?.music_url} loop />
      <button onClick={toggleMusic} className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-black text-white border-4 border-white">
        {isPlaying ? <Pause /> : <Play fill="white" />}
      </button>
    </div>
  );
};

/* ================= GALLERY ================= */
const GalleryPage = () => {
  const [quotes, setQuotes] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    supabase.from('quotes').select('*').order('created_at', { ascending: false })
      .then(({ data }) => setQuotes(data || []));
  }, []);

  return (
    <div className="min-h-screen bg-[#E9E4D9] p-6 md:p-12 font-serif">
      <Link to="/" className="inline-flex items-center gap-2 mb-10 font-black uppercase text-xs border-b-2 border-black">
        <ArrowLeft size={14}/> Back
      </Link>

      <input
        placeholder="Search archive..."
        className="w-full mb-8 p-4 border-4 border-black font-mono"
        onChange={e => setSearch(e.target.value)}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {quotes
          .filter(q => q.text.toLowerCase().includes(search.toLowerCase()))
          .map(q => (
            <div key={q.id} className="bg-white border-4 border-black p-6">
              <p className="font-bold italic">"{q.text}"</p>
              <p className="text-[9px] font-mono opacity-40">{new Date(q.created_at).toLocaleDateString()}</p>
            </div>
          ))}
      </div>
    </div>
  );
};

/* ================= LOGIN ================= */
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert("Unauthorized Command.");
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <form onSubmit={handleLogin} className="bg-[#E9E4D9] border-4 border-black p-10 w-full max-w-sm">
        <h2 className="text-3xl font-black uppercase mb-8 italic flex items-center gap-3">
          <Lock size={30}/> Restricted
        </h2>
        <input className="w-full p-4 border-2 border-black mb-4" onChange={e => setEmail(e.target.value)} />
        <input type="password" className="w-full p-4 border-2 border-black mb-6" onChange={e => setPassword(e.target.value)} />
        <button className="w-full bg-black text-white p-5 font-black uppercase italic">Authorize</button>
        <Link to="/" className="block text-center mt-6 text-xs underline uppercase opacity-50">Return</Link>
      </form>
    </div>
  );
};

/* ================= APP ROOT ================= */
export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/admin" element={session ? <Navigate to="/" /> : <Login />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
