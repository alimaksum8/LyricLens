import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Music, Sparkles, Send, Loader2, History, Trash2, PenTool, ArrowLeft, Copy, Check } from 'lucide-react';
import { describeLyrics, generateNewLyrics } from './services/geminiService';

const SONGWRITERS = [
  "Ahmad Dhani", "Rhoma Irama", "Opick", "Dody Kangen Band", 
  "Melly Goeslaw", "Deddy Dores", "Ariel NOAH", "Eros Candra", "Tulus",
  "Youngky RM", "Cecep AS", "Saari Amri", "Teddy Riady", "Pance Pondaag"
];

const MODELS = [
  { id: 'gemini-3-flash-preview', label: 'Gemini 3.0 Flash' },
  { id: 'gemini-3.1-flash-lite-preview', label: 'Gemini 3.1 Flash' }
];

const DURATIONS = ["5mnt", "6mnt", "7mnt", "8mnt", "9mnt", "10mnt"];

export default function App() {
  const [lyrics, setLyrics] = useState('');
  const [result, setResult] = useState('');
  const [newLyrics, setNewLyrics] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [view, setView] = useState<'analysis' | 'new-lyrics'>('analysis');
  const [selectedSongwriter, setSelectedSongwriter] = useState(SONGWRITERS[0]);
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id);
  const [selectedDuration, setSelectedDuration] = useState(DURATIONS[0]);
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [copiedLyrics, setCopiedLyrics] = useState(false);

  const handleDescribe = async () => {
    if (!lyrics.trim()) {
      setError('Silakan masukkan lirik terlebih dahulu.');
      return;
    }

    setLoading(true);
    setError('');
    setResult('');
    setNewLyrics('');
    setNewTitle('');
    setView('analysis');

    try {
      const description = await describeLyrics(lyrics, selectedModel);
      setResult(description);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateNew = async () => {
    if (!lyrics || !result) return;

    setGenerating(true);
    setError('');
    
    try {
      const { title, lyrics: generatedLyrics } = await generateNewLyrics(
        lyrics, 
        result, 
        selectedSongwriter, 
        selectedModel,
        selectedDuration
      );
      setNewTitle(title);
      setNewLyrics(generatedLyrics);
      setView('new-lyrics');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membuat lirik baru.');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyTitle = async () => {
    if (!newTitle) return;
    try {
      await navigator.clipboard.writeText(newTitle);
      setCopiedTitle(true);
      setTimeout(() => setCopiedTitle(false), 2000);
    } catch (err) {
      console.error('Failed to copy title: ', err);
    }
  };

  const handleCopyLyrics = async () => {
    if (!newLyrics) return;
    try {
      await navigator.clipboard.writeText(newLyrics);
      setCopiedLyrics(true);
      setTimeout(() => setCopiedLyrics(false), 2000);
    } catch (err) {
      console.error('Failed to copy lyrics: ', err);
    }
  };

  const clearAll = () => {
    setLyrics('');
    setResult('');
    setNewLyrics('');
    setNewTitle('');
    setError('');
    setView('analysis');
  };

  return (
    <div className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center p-4 md:p-8">
      {/* Atmospheric Background */}
      <div className="fixed inset-0 atmosphere -z-10" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl z-10"
      >
        <header className="text-center mb-12">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#ff4e00]/20 mb-4"
          >
            <Music className="text-[#ff4e00] w-8 h-8" />
          </motion.div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tighter mb-2">
            Lyric<span className="text-[#ff4e00]">Lens</span>
          </h1>
          <p className="text-white/60 text-lg mb-6">Ungkap makna tersembunyi dan ciptakan karya baru.</p>
          
          <div className="flex items-center justify-center gap-3 mb-8">
            {MODELS.map((model) => (
              <button
                key={model.id}
                onClick={() => setSelectedModel(model.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
                  selectedModel === model.id
                    ? 'bg-[#ff4e00] border-[#ff4e00] text-white shadow-lg shadow-[#ff4e00]/20'
                    : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                }`}
              >
                {model.label}
              </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <section className="glass-panel p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-white/40 flex items-center gap-2">
                <Send className="w-4 h-4" /> Input Lirik
              </h2>
              {lyrics && (
                <button 
                  onClick={clearAll}
                  className="text-white/40 hover:text-white transition-colors"
                  title="Bersihkan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <textarea
              className="lyric-input h-64 lg:h-96"
              placeholder="Tempelkan lirik lagu di sini..."
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
            />

            <button
              onClick={handleDescribe}
              disabled={loading || generating}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Menganalisis...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Deskripsikan
                </>
              )}
            </button>
          </section>

          {/* Result Section */}
          <section className="glass-panel p-6 flex flex-col gap-4 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-white/40 flex items-center gap-2">
                {view === 'analysis' ? (
                  <><History className="w-4 h-4" /> Hasil Analisis</>
                ) : (
                  <><PenTool className="w-4 h-4" /> Lirik Baru</>
                )}
              </h2>
              {view === 'new-lyrics' && (
                <button 
                  onClick={() => setView('analysis')}
                  className="text-white/40 hover:text-white transition-colors flex items-center gap-1 text-xs"
                >
                  <ArrowLeft className="w-3 h-3" /> Kembali ke Analisis
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
              <AnimatePresence mode="wait">
                {loading || generating ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="h-full flex flex-col items-center justify-center text-white/40 gap-4"
                  >
                    <div className="relative">
                      <div className="w-12 h-12 border-4 border-[#ff4e00]/20 border-t-[#ff4e00] rounded-full animate-spin" />
                      <Sparkles className="absolute inset-0 m-auto w-4 h-4 text-[#ff4e00] animate-pulse" />
                    </div>
                    <p className="animate-pulse">
                      {loading ? 'LyricLens sedang merangkai kata...' : `${selectedSongwriter} sedang merangkai kata...`}
                    </p>
                  </motion.div>
                ) : error ? (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                  >
                    {error}
                  </motion.div>
                ) : view === 'analysis' && result ? (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col h-full"
                  >
                    <div className="space-y-6 font-serif leading-relaxed text-lg text-white/90 flex-1">
                      {result.split('\n\n').map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                    </div>
                    
                    <div className="mt-8 space-y-4">
                      <h3 className="text-xs font-semibold uppercase tracking-widest text-white/30">
                        Pilih Gaya Pencipta Lagu:
                      </h3>
                      <div className="grid grid-cols-3 gap-2">
                        {SONGWRITERS.map((name) => (
                          <button
                            key={name}
                            onClick={() => setSelectedSongwriter(name)}
                            className={`py-2 px-1 text-[10px] md:text-xs rounded-xl border transition-all ${
                              selectedSongwriter === name 
                                ? 'bg-[#ff4e00]/20 border-[#ff4e00] text-white' 
                                : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'
                            }`}
                          >
                            {name}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={handleGenerateNew}
                      className="mt-6 py-3 px-4 rounded-2xl bg-[#ff4e00] hover:bg-[#ff6a26] text-white transition-all flex items-center justify-center gap-2 group shadow-lg shadow-[#ff4e00]/20"
                    >
                      <PenTool className="w-4 h-4 group-hover:scale-110 transition-transform" />
                      Jadikan Lirik Baru (Gaya {selectedSongwriter})
                    </motion.button>

                    <div className="mt-4 flex flex-col gap-2">
                      <label className="text-[10px] font-semibold text-white/30 uppercase tracking-widest px-1">
                        Target Durasi Lagu:
                      </label>
                      <div className="relative">
                        <select
                          value={selectedDuration}
                          onChange={(e) => setSelectedDuration(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-[#ff4e00]/50 transition-all appearance-none cursor-pointer"
                        >
                          {DURATIONS.map((d) => (
                            <option key={d} value={d} className="bg-[#0a0a0b]">
                              {d}
                            </option>
                          ))}
                        </select>
                        <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-white/20">
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                            <path d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ) : view === 'new-lyrics' && newLyrics ? (
                  <motion.div
                    key="new-lyrics"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative group h-full flex flex-col"
                  >
                    <div className="absolute top-0 right-0 z-20 flex gap-2">
                      <button
                        onClick={handleCopyTitle}
                        className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 hover:text-white transition-all flex items-center gap-2 text-[10px] md:text-xs"
                      >
                        {copiedTitle ? (
                          <>
                            <Check className="w-3 h-3 text-green-400" />
                            Judul Tersalin!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            Salin Judul
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleCopyLyrics}
                        className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 hover:text-white transition-all flex items-center gap-2 text-[10px] md:text-xs"
                      >
                        {copiedLyrics ? (
                          <>
                            <Check className="w-3 h-3 text-green-400" />
                            Lirik Tersalin!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            Salin Lirik
                          </>
                        )}
                      </button>
                    </div>
                    <div className="space-y-6 pt-12 flex-1">
                      {/* Title Column */}
                      <div className="p-4 rounded-2xl bg-[#ff4e00]/10 border border-[#ff4e00]/20">
                        <h3 className="text-xs font-semibold uppercase tracking-widest text-[#ff4e00] mb-1">Judul Lagu</h3>
                        <p className="text-2xl font-bold tracking-tight text-white">{newTitle}</p>
                      </div>

                      {/* Lyrics Column */}
                      <div className="space-y-4 font-serif leading-relaxed text-lg text-white/90 whitespace-pre-wrap pb-8">
                        {newLyrics}
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center text-white/20 text-center"
                  >
                    <Music className="w-12 h-12 mb-4 opacity-10" />
                    <p>Hasil analisis akan muncul di sini setelah Anda menekan tombol deskripsikan.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>
        </div>

        <footer className="mt-12 text-center text-white/20 text-xs uppercase tracking-[0.2em]">
          Powered by Gemini AI • LyricLens 2026
        </footer>
      </motion.div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 78, 0, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 78, 0, 0.4);
        }
      `}</style>
    </div>
  );
}
