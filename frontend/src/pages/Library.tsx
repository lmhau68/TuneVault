import { useState, useContext } from 'react';
import { PlayerContext } from '../App';

export default function Library() {
  const [localQuery, setLocalQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'All' | 'Audio' | 'Video'>('All');

  const { librarySongs, toggleLibrarySong, handleSelectMedia } = useContext(PlayerContext) || {};

  const handleRemoveSong = (id: number) => {
    if (toggleLibrarySong) toggleLibrarySong(id);
  };

  const filteredSongs = librarySongs?.filter((s: any) => {
    const matchesSearch = s.title.toLowerCase().includes(localQuery.toLowerCase()) || 
                          (s.artist && s.artist.toLowerCase().includes(localQuery.toLowerCase()));
    if (!matchesSearch) return false;
    
    if (activeTab === 'All') return true;
    return s.mediaType === activeTab;
  }) || [];

  return (
    <div className="space-y-6 animate-fade-in pb-12 p-2 sm:p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div>
          <h2 className="text-2xl font-black text-white">Thư viện của bạn</h2>
          <p className="text-zinc-500 text-xs mt-1">Danh sách tất cả bài hát và video bạn đã lưu.</p>
        </div>
        
        <div className="relative w-full md:max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </span>
          <input 
            type="text" 
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="Tìm trong thư viện..."
            className="w-full bg-zinc-900 border border-zinc-800 focus:border-emerald-500 text-white text-xs pl-9 pr-8 py-2.5 rounded-full outline-none transition"
          />
          {localQuery && (
            <button onClick={() => setLocalQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white text-[10px]">✕</button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-2">
        {['All', 'Audio', 'Video'].map(tab => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors cursor-pointer border ${activeTab === tab ? 'bg-white text-black border-white' : 'bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-white'}`}
          >
            {tab === 'All' ? 'Tất cả nội dung' : tab === 'Audio' ? '🎵 Chỉ Bài hát' : '🎬 Chỉ Video'}
          </button>
        ))}
      </div>

      {filteredSongs.length > 0 ? (
        <div className="mt-4 flex flex-col gap-2">
          {filteredSongs.map((song: any) => (
            <div 
              key={`song-${song.id}`} 
              onClick={() => handleSelectMedia && handleSelectMedia(song)}
              className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/40 hover:bg-zinc-800/80 transition group cursor-pointer border border-transparent hover:border-zinc-700/50"
            >
              <div className="flex items-center gap-4 min-w-0 flex-1">
                {song.thumbnailPath ? (
                  <img src={song.thumbnailPath} alt="" className="w-12 h-12 rounded object-cover shadow border border-zinc-800 shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded bg-zinc-800 flex items-center justify-center text-lg shrink-0 shadow">
                    {song.mediaType === 'Video' ? '🎬' : '🎵'}
                  </div>
                )}
                <div className="truncate pr-4">
                  <p className="text-sm font-bold text-white truncate group-hover:text-emerald-400 transition">{song.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-black uppercase tracking-wider ${song.mediaType === 'Video' ? 'bg-red-500/10 text-red-400' : 'bg-zinc-800 text-zinc-400'}`}>
                      {song.mediaType}
                    </span>
                    <span className="text-[11px] text-zinc-500 truncate">{song.artist || "Unknown Artist"}</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={(e) => { e.stopPropagation(); handleRemoveSong(song.id); }} 
                className="p-2.5 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all shrink-0 hover:bg-red-500/10 rounded-full"
                title="Xóa khỏi thư viện"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2M10 11v6M14 11v6" /></svg>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-zinc-500 text-xs italic py-16 bg-zinc-900/20 rounded-xl border border-dashed border-zinc-800 mt-4">
          <span className="text-4xl block mb-3 opacity-50">📂</span>
          Không có nội dung nào khớp với bộ lọc "{activeTab === 'All' ? 'Tất cả' : activeTab === 'Audio' ? 'Bài hát' : 'Video'}" của bạn.
        </div>
      )}
    </div>
  );
}