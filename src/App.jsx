import React, { useState, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, LogOut, Lock, Heart, Music, Quote, 
  Plus, Trash2, Settings as SettingsIcon, LayoutDashboard, Save, 
  Image as ImageIcon, Pin, PinOff, Search, Eye, ArrowLeft, X
} from 'lucide-react';

// --- FRONTEND: LANDING PAGE ---
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
    const { data: q } = await supabase.from('quotes').select('*').eq('is_pinned', true).order('created_at', { ascending: false }).limit(5);
    const { data: s } = await supabase.from('settings').select('*').single();
    setPinnedQuotes(q || []);
    setSettings(s);
  };

  const toggleMusic = () => {
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="min-h-screen bg-[#E9E4D9] p-4 md:p-12 font-serif selection:bg-pink-200">
      <header className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-8 mb-16 mt-4">
        <div className="relative group">
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-full border-[4px] border-black overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-pink-300">
            <img src={settings?.profile_url || "https://via.placeholder.com/150"} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" alt="profile"/>
          </div>
          <Heart className="absolute -bottom-1 -right-1 bg-yellow-300 border-2 border-black p-2 rounded-full animate-pulse" size={40} fill="red" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-[12vw] md:text-[80px] font-black italic uppercase tracking-tighter leading-[0.8] mb-4 text-black">flyhighlana.</h1>
          <div className="h-1 w-full bg-black mb-2" />
          <p className="text-[10px] font-mono uppercase tracking-[0.5em] opacity-50 italic">Pinned Memories & Digital Journal</p>
        </div>
      </header>

      {/* Grid Centered for Desktop */}
      <main className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24 justify-items-center lg:justify-center">
        <AnimatePresence>
          {pinnedQuotes.map((q, i) => (
            <motion.div key={q.id} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}
              className="bg-white border-[3px] border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] flex flex-col relative group overflow-hidden w-full max-w-sm">
              {q.image_url && <div className="h-48 border-b-[3px] border-black overflow-hidden"><img src={q.image_url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" alt="quote"/></div>}
              <div className="p-6">
                <Pin size={14} className="absolute top-3 right-3 text-pink-500" />
                <p className="text-xl font-bold italic leading-tight mb-4">"{q.text}"</p>
                <div className="border-t border-black pt-2 flex justify-between items-center text-[9px] font-mono opacity-40 uppercase tracking-widest">
                  <span>Note #{pinnedQuotes.length - i}</span>
                  <span>{new Date(q.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </motion.div>
          ))}
          <Link to="/gallery" className="group w-full max-w-sm">
            <div className="h-full min-h-[220px] bg-black text-white border-[3px] border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,0.2)] flex flex-col items-center justify-center p-6 hover:bg-zinc-800 transition-colors">
              <Plus size={48} className="mb-2 group-hover:rotate-90 transition-transform" />
              <p className="font-black uppercase tracking-tighter text-xl italic">Explore All Archive</p>
            </div>
          </Link>
        </AnimatePresence>
      </main>

      <div className="fixed bottom-8 right-8 z-50 flex items-center gap-4">
        {isPlaying && <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="hidden md:block bg-white border-2 border-black px-4 py-2 font-mono text-[10px] font-bold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] tracking-widest">NOW PLAYING: {settings?.music_title || "LANA RADIO"}</motion.div>}
        <audio ref={audioRef} src={settings?.music_url} loop />
        <button onClick={toggleMusic} className="w-16 h-16 rounded-full bg-black text-white border-4 border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
          {isPlaying ? <Pause size={28} /> : <Play size={28} fill="white" className="ml-1" />}
        </button>
      </div>
    </div>
  );
};

// --- FRONTEND: GALLERY PAGE ---
const GalleryPage = () => {
  const [quotes, setQuotes] = useState([]);
  const [search, setSearch] = useState('');
  const [year, setYear] = useState('');

  useEffect(() => { fetchAll(); }, [year]);

  const fetchAll = async () => {
    let query = supabase.from('quotes').select('*').order('created_at', { ascending: false });
    if (year) query = query.gte('created_at', `${year}-01-01`).lte('created_at', `${year}-12-31`);
    const { data } = await query;
    setQuotes(data || []);
  };

  const filtered = quotes.filter(q => q.text.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#E9E4D9] p-6 md:p-12 font-serif">
      <div className="max-w-6xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 mb-10 font-black uppercase text-xs border-b-2 border-black pb-1 tracking-widest"><ArrowLeft size={14}/> Back to Archive</Link>
        <div className="flex flex-col md:flex-row gap-4 mb-16">
          <input placeholder="Search archive..." className="flex-1 p-4 border-[3px] border-black bg-white outline-none font-mono text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" onChange={(e) => setSearch(e.target.value)} />
          <select className="p-4 border-[3px] border-black bg-white font-mono text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" onChange={(e) => setYear(e.target.value)}>
            <option value="">All Years</option><option value="2025">2025</option><option value="2024">2024</option>
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 justify-items-center">
          {filtered.map(q => (
            <div key={q.id} className="bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden flex flex-col w-full max-w-sm">
              {q.image_url && <img src={q.image_url} className="w-full h-56 object-cover border-b-2 border-black" alt="archive"/>}
              <div className="p-6">
                <p className="font-bold italic mb-4">"{q.text}"</p>
                <p className="text-[9px] font-mono opacity-40 uppercase tracking-widest">{new Date(q.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- BACKEND: ADMIN DASHBOARD ---
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('quotes');
  const [quotes, setQuotes] = useState([]);
  const [newQuote, setNewQuote] = useState({ text: '', image_url: '', is_pinned: false });
  const [settings, setSettings] = useState({ profile_url: '', music_url: '', music_title: '' });
  const [filter, setFilter] = useState({ year: '', search: '' });
  const [selectedQuote, setSelectedQuote] = useState(null);

  useEffect(() => { fetchData(); }, [filter.year]);

  const fetchData = async () => {
    let qQuery = supabase.from('quotes').select('*').order('created_at', { ascending: false });
    if (filter.year) qQuery = qQuery.gte('created_at', `${filter.year}-01-01`).lte('created_at', `${filter.year}-12-31`);
    const { data: qData } = await qQuery;
    const { data: sData } = await supabase.from('settings').select('*').single();
    if (qData) setQuotes(qData);
    if (sData) setSettings(sData);
  };

  const addQuote = async () => {
    if (!newQuote.text) return;
    await supabase.from('quotes').insert([newQuote]);
    setNewQuote({ text: '', image_url: '', is_pinned: false });
    fetchData();
  };

  const togglePin = async (q) => {
    await supabase.from('quotes').update({ is_pinned: !q.is_pinned }).eq('id', q.id);
    fetchData();
  };

  const deleteQuote = async (id) => {
    if (window.confirm("Delete this memory?")) {
      await supabase.from('quotes').delete().eq('id', id);
      fetchData();
    }
  };

  const updateSettings = async () => {
    await supabase.from('settings').update(settings).eq('id', 1);
    alert("Settings Updated!");
  };

  const filteredList = quotes.filter(q => q.text.toLowerCase().includes(filter.search.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#111] flex flex-col md:flex-row font-mono text-white">
      <aside className="w-full md:w-64 bg-black border-r border-zinc-800 p-8 flex flex-col gap-6 shrink-0">
        <h2 className="text-2xl font-black italic border-b-2 border-white pb-4 tracking-tighter uppercase">Lana_OS v2.0</h2>
        <nav className="flex flex-col gap-3">
          <button onClick={() => setActiveTab('quotes')} className={`p-4 border-2 border-white text-[10px] font-bold text-left tracking-widest uppercase transition-all ${activeTab === 'quotes' ? 'bg-white text-black' : 'hover:bg-zinc-900'}`}><LayoutDashboard className="inline mr-2" size={14}/> Quotes Mgr</button>
          <button onClick={() => setActiveTab('settings')} className={`p-4 border-2 border-white text-[10px] font-bold text-left tracking-widest uppercase transition-all ${activeTab === 'settings' ? 'bg-white text-black' : 'hover:bg-zinc-900'}`}><SettingsIcon className="inline mr-2" size={14}/> System Settings</button>
          <button onClick={() => supabase.auth.signOut()} className="mt-10 p-4 bg-red-600 border-2 border-white text-[10px] font-black uppercase italic tracking-widest">Shutdown</button>
        </nav>
      </aside>

      <main className="flex-1 p-8 md:p-16 bg-[#E9E4D9] text-black overflow-y-auto">
        {activeTab === 'quotes' ? (
          <div className="max-w-4xl mx-auto">
            <h3 className="text-5xl font-black mb-10 tracking-tighter uppercase border-b-4 border-black inline-block italic">Archive Mgr</h3>
            <div className="bg-white border-[3px] border-black p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-12">
              <textarea placeholder="Write a new thought..." className="w-full h-24 border-2 border-black p-4 text-lg outline-none mb-4 bg-zinc-50" value={newQuote.text} onChange={(e) => setNewQuote({...newQuote, text: e.target.value})} />
              <input placeholder="Image URL (Optional)" className="w-full p-3 border-2 border-black mb-4 text-xs font-mono" value={newQuote.image_url} onChange={(e) => setNewQuote({...newQuote, image_url: e.target.value})} />
              <label className="flex items-center gap-2 mb-4 text-[10px] font-black uppercase tracking-widest cursor-pointer"><input type="checkbox" checked={newQuote.is_pinned} onChange={(e) => setNewQuote({...newQuote, is_pinned: e.target.checked})} className="w-4 h-4 border-2 border-black accent-black" /> Pin to Home Page (Max 5)</label>
              <button onClick={addQuote} className="w-full bg-[#34D399] p-4 font-black text-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all uppercase italic">Execute Archive</button>
            </div>
            <div className="flex gap-4 mb-8">
              <input placeholder="Search records..." className="flex-1 p-3 border-2 border-black text-sm outline-none" onChange={(e)=>setFilter({...filter, search: e.target.value})} />
              <select className="border-2 border-black p-3 text-sm" onChange={(e)=>setFilter({...filter, year: e.target.value})}><option value="">All Years</option><option value="2025">2025</option><option value="2024">2024</option></select>
            </div>
            <div className="space-y-4">
              {filteredList.map(q => (
                <div key={q.id} className="bg-white border-2 border-black p-4 flex justify-between items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex-1 truncate"><p className="font-bold italic text-sm truncate">"{q.text}"</p><p className="text-[9px] opacity-40 uppercase">{new Date(q.created_at).toLocaleDateString()}</p></div>
                  <div className="flex gap-5 ml-4">
                    <button onClick={() => togglePin(q)} className={q.is_pinned ? "text-pink-500" : "text-zinc-300"}><Pin size={18} /></button>
                    <button onClick={() => setSelectedQuote(q)} className="text-blue-500"><Eye size={18} /></button>
                    <button onClick={() => deleteQuote(q.id)} className="text-red-500"><Trash2 size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
             <h3 className="text-5xl font-black mb-10 tracking-tighter uppercase border-b-4 border-black inline-block italic">System Media</h3>
             <div className="bg-white border-[3px] border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] space-y-8">
                <div><label className="block text-[10px] font-black mb-2 uppercase tracking-[0.3em] text-zinc-400">Profile Image (URL)</label><input className="w-full p-3 border-2 border-black text-xs font-mono" value={settings.profile_url || ''} onChange={(e)=>setSettings({...settings, profile_url: e.target.value})} /></div>
                <div><label className="block text-[10px] font-black mb-2 uppercase tracking-[0.3em] text-zinc-400">Audio Metadata</label><input placeholder="Track Title" className="w-full p-3 border-2 border-black mb-4 text-xs font-bold" value={settings.music_title || ''} onChange={(e)=>setSettings({...settings, music_title: e.target.value})} /><input placeholder="MP3 URL" className="w-full p-3 border-2 border-black text-xs font-mono" value={settings.music_url || ''} onChange={(e)=>setSettings({...settings, music_url: e.target.value})} /></div>
                <button onClick={updateSettings} className="w-full bg-[#60A5FA] p-5 font-black text-2xl border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all uppercase italic flex items-center justify-center gap-3"><Save size={24}/> Commit Changes</button>
             </div>
          </div>
        )}
      </main>

      {/* Detail Pop-up */}
      <AnimatePresence>
        {selectedQuote && (
          <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 backdrop-blur-md" onClick={()=>setSelectedQuote(null)}>
            <motion.div initial={{ scale: 0.9, rotate: -1 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0.9 }} className="bg-white border-4 border-black max-w-2xl w-full p-8 relative" onClick={e=>e.stopPropagation()}>
              <button className="absolute top-4 right-4 bg-black text-white p-2" onClick={()=>setSelectedQuote(null)}><X size={24}/></button>
              {selectedQuote.image_url && <img src={selectedQuote.image_url} className="w-full h-80 object-cover border-2 border-black mb-6 shadow-md" alt="detail"/>}
              <Quote className="opacity-10 mb-2" size={48} />
              <p className="text-3xl font-black italic leading-tight mb-8">"{selectedQuote.text}"</p>
              <div className="flex justify-between font-mono text-[10px] border-t-2 border-black pt-4 uppercase tracking-widest font-black opacity-50"><span>ID: {selectedQuote.id.slice(0,8)}</span><span>Date: {new Date(selectedQuote.created_at).toLocaleString()}</span></div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- AUTH & ROUTER ---
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const handleLogin = async (e) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert("Unauthorized Command.");
  };
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 text-black">
      <div className="bg-[#E9E4D9] border-[4px] border-black p-10 w-full max-w-sm shadow-[15px_15px_0px_0px_rgba(255,255,255,0.1)]">
        <h2 className="text-3xl font-black uppercase mb-8 border-b-4 border-black pb-2 italic flex items-center gap-3"><Lock size={30}/> Restricted</h2>
        <form onSubmit={handleLogin} className="space-y-5">
          <input type="email" placeholder="ADMIN_LOGIN" className="w-full p-4 border-2 border-black bg-transparent font-mono outline-none" onChange={(e)=>setEmail(e.target.value)} />
          <input type="password" placeholder="PASSWORD" className="w-full p-4 border-2 border-black bg-transparent font-mono outline-none" onChange={(e)=>setPassword(e.target.value)} />
          <button className="w-full bg-black text-white p-5 font-black uppercase tracking-widest text-xl hover:bg-zinc-800 transition-colors italic">Authorize</button>
        </form>
        <Link to="/" className="block text-center mt-8 text-[10px] font-black underline uppercase opacity-50">Return to Archive</Link>
      </div>
    </div>
  );
};

export default function App() {
  const [session, setSession] = useState(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/gallery" element={<GalleryPage />} />
      <Route path="/admin" element={session ? <AdminDashboard /> : <Login />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}