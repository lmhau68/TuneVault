import { useEffect, useState, useContext, useRef } from 'react';
import { mediaService } from '../services/api';
import { type Song } from '../types/media';
import { PlayerContext } from '../App';

export default function Playlist() {
  const [tracks, setTracks] = useState<Song[]>([]);
  const [isTrackLoading, setIsTrackLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'All' | 'Audio' | 'Video'>('All');
  
  const [activeTrackMenuId, setActiveTrackMenuId] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const { handleSelectMedia, selectedPlaylist, likedSongs, savedPlaylists, toggleSavePlaylist, setSavedPlaylists, toggleSongInPlaylist } = useContext(PlayerContext) || {};

  useEffect(() => {
    if (selectedPlaylist?.id === 'liked-playlist') {
      setTracks(likedSongs || []);
      setIsTrackLoading(false);
    } else if (selectedPlaylist) {
      setIsTrackLoading(true);
      mediaService.getPlaylistTracks(selectedPlaylist.id)
        .then(data => setTracks(Array.isArray(data) ? data : []))
        .catch(() => setTracks([]))
        .finally(() => setIsTrackLoading(false));
    } else {
      setTracks([]);
    }
  }, [selectedPlaylist, likedSongs]);

  useEffect(() => {
    const handleRefresh = () => {
       if (selectedPlaylist && selectedPlaylist.id !== 'liked-playlist') {
          mediaService.getPlaylistTracks(selectedPlaylist.id).then(data => setTracks(data || []));
       }
    };
    window.addEventListener('playlist_tracks_updated', handleRefresh);
    return () => window.removeEventListener('playlist_tracks_updated', handleRefresh);
  }, [selectedPlaylist]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveTrackMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleRemoveTrack = async (songId: number) => {
    if (!selectedPlaylist) return;
    setActiveTrackMenuId(null);
    if (selectedPlaylist.id === 'liked-playlist') {
       alert("Sử dụng nút Trái Tim ở trình phát nhạc để gỡ bài hát khỏi danh sách Yêu thích nhé!");
       return;
    }
    
    try {
      if (toggleSongInPlaylist) {
          await toggleSongInPlaylist(selectedPlaylist.id, songId);
      }
      setTracks(prev => prev.filter(t => t.id !== songId));
    } catch {
      alert("Xóa bài hát thất bại. Vui lòng kiểm tra lại kết nối backend.");
    }
  };


  const handleAddToQueue = (song: Song) => {
    setActiveTrackMenuId(null);
    alert(`Đã xếp tệp tin "${song.title}" vào hàng đợi danh sách phát tạm thời của hệ thống!`);
  };

  const filteredTracks = tracks.filter(track => {
    if (activeFilter === 'All') return true;
    return track.mediaType === activeFilter;
  });

  if (!selectedPlaylist) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-[calc(100vh-160px)] text-zinc-500 text-xs text-center px-6 italic bg-zinc-900/10 rounded-2xl border border-dashed border-zinc-800/60 m-2">
        <span className="text-4xl mb-2 not-italic">💿</span>
        <span className="font-extrabold text-sm text-zinc-400 not-italic mb-1">Chưa chọn Danh sách phát</span>
        Vui lòng nhấn chọn một Playlist từ thanh Sidebar bên trái để bắt đầu theo dõi nội dung chi tiết.
      </div>
    );
  }

  const isPlaylistSaved = savedPlaylists?.some((p: any) => p.id === selectedPlaylist.id);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-gradient-to-b from-zinc-900/60 to-black rounded-2xl border border-zinc-950 p-4 md:p-6 shadow-2xl relative animate-fade-in">
      
      <div className="flex flex-col md:flex-row items-center md:items-end gap-5 mb-6 border-b border-zinc-800/60 pb-6 shrink-0 text-center md:text-left">
        <div className={`w-32 h-32 md:w-40 md:h-40 rounded-xl flex items-center justify-center text-6xl shadow-2xl select-none shrink-0 border border-zinc-700/30 ${selectedPlaylist.id === 'liked-playlist' ? 'bg-gradient-to-br from-emerald-500 to-emerald-900' : 'bg-gradient-to-tr from-zinc-700 to-zinc-900'}`}>
          {selectedPlaylist.id === 'liked-playlist' ? '💚' : '🎵'}
        </div>
        <div className="min-w-0">
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider mb-2 inline-block">
            {selectedPlaylist.id === 'liked-playlist' ? 'Bộ Sưu Tập' : 'Danh mục lưu trữ'}
          </span>
          
          <div className="flex items-center justify-center md:justify-start gap-3 py-1">
            <h2 className="text-2xl md:text-4xl font-black text-white truncate tracking-tight">{selectedPlaylist.name}</h2>
            {selectedPlaylist.id !== 'liked-playlist' && (
              <button 
                onClick={() => { if (toggleSavePlaylist) toggleSavePlaylist(selectedPlaylist); }}
                className={`transition transform active:scale-90 p-2 rounded-full shrink-0 cursor-pointer ${isPlaylistSaved ? 'text-emerald-500 bg-emerald-500/10' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}
                title={isPlaylistSaved ? "Bỏ lưu danh sách phát" : "Lưu vào Thư viện"}
              >
                <svg viewBox="0 0 24 24" fill={isPlaylistSaved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </button>
            )}
          </div>

          <p className="text-xs text-zinc-400 mt-1.5 font-medium line-clamp-2 leading-relaxed max-w-lg mx-auto md:mx-0">{selectedPlaylist.description || "Không có mô tả thông tin cho danh sách phát này."}</p>
          <div className="text-[11px] text-zinc-500 font-bold mt-2 flex items-center justify-center md:justify-start gap-2">
            <span>Chủ sở hữu: Hệ thống TuneVault</span>
            <span>•</span>
            <span className="text-zinc-300 font-extrabold">{tracks.length} bài hát/video</span>
          </div>
          
          <div className="flex items-center justify-center md:justify-start gap-2 mt-4 pt-2">
            <button onClick={() => setActiveFilter('All')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${activeFilter === 'All' ? 'bg-white text-black' : 'bg-zinc-800/80 text-zinc-400 hover:text-white'}`}>Tất cả</button>
            <button onClick={() => setActiveFilter('Audio')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${activeFilter === 'Audio' ? 'bg-white text-black' : 'bg-zinc-800/80 text-zinc-400 hover:text-white'}`}>Bài hát</button>
            <button onClick={() => setActiveFilter('Video')} className={`px-4 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${activeFilter === 'Video' ? 'bg-white text-black' : 'bg-zinc-800/80 text-zinc-400 hover:text-white'}`}>Video</button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 min-h-0 relative">
        {isTrackLoading ? (
          <p className="text-center text-zinc-500 text-xs animate-pulse py-12 italic">Đang đồng bộ dữ liệu bài hát từ máy chủ...</p>
        ) : filteredTracks.length > 0 ? (

          (<div className="space-y-1.5 pb-[200px]">
            <div className="grid grid-cols-12 px-2 md:px-4 py-2 text-[11px] font-black uppercase tracking-wider text-zinc-500 border-b border-zinc-900 mb-2">
              <div className="col-span-1 hidden sm:block">#</div>
              <div className="col-span-9 sm:col-span-8">Tiêu đề bài viết</div>
              <div className="col-span-2 hidden sm:block text-center">Định dạng</div>
              <div className="col-span-3 sm:col-span-1 text-right">Hành động</div>
            </div>

            {filteredTracks.map((song, idx) => {
              const isMenuOpen = activeTrackMenuId === song.id;
              return (
                <div 
                  key={song.id}
                  className="grid grid-cols-12 items-center px-2 md:px-4 py-3 bg-zinc-900/20 hover:bg-zinc-800/50 rounded-xl text-xs transition duration-150 group border border-transparent hover:border-zinc-800/40 cursor-pointer relative"
                >
                  <div className="col-span-1 hidden sm:block text-zinc-500 font-bold text-xs group-hover:text-emerald-400 transition" onClick={() => handleSelectMedia && handleSelectMedia(song, selectedPlaylist)}>
                    {idx + 1}
                  </div>

                  <div className="col-span-9 sm:col-span-8 min-w-0 flex items-center gap-3" onClick={() => handleSelectMedia && handleSelectMedia(song, selectedPlaylist)}>
                    {song.thumbnailPath ? (
                      <img src={song.thumbnailPath} alt="" className="w-10 h-10 rounded object-cover shadow border border-zinc-800 shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded bg-zinc-800 flex items-center justify-center shrink-0">🎵</div>
                    )}
                    <div className="min-w-0 pr-2">
                      <p className="font-extrabold text-white truncate group-hover:text-emerald-400 transition">{song.title}</p>
                      <p className="text-[11px] text-zinc-500 truncate mt-0.5">{song.artist || "Unknown Artist"} • {song.mediaType}</p>
                    </div>
                  </div>

                  <div className="col-span-2 hidden sm:block text-center" onClick={() => handleSelectMedia && handleSelectMedia(song, selectedPlaylist)}>
                    <span className={`px-2 py-0.5 text-[9px] font-black rounded uppercase ${song.mediaType === 'Video' ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                      {song.mediaType}
                    </span>
                  </div>

                  <div className="col-span-3 sm:col-span-1 text-right relative flex justify-end">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveTrackMenuId(isMenuOpen ? null : song.id);
                      }}
                      className="w-8 h-8 inline-flex items-center justify-center rounded-full text-zinc-400 hover:text-white hover:bg-zinc-800 border border-transparent hover:border-zinc-700/50 transition active:scale-90"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4">
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="19" cy="12" r="1"></circle>
                        <circle cx="5" cy="12" r="1"></circle>
                      </svg>
                    </button>

                    {isMenuOpen && (
                      <div 
                        ref={menuRef}
                        className="absolute right-0 top-9 bg-[#282828] border border-zinc-700 w-48 sm:w-56 rounded-xl p-1.5 shadow-2xl z-50 animate-fade-in text-left"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button 
                          onClick={() => handleAddToQueue(song)}
                          className="w-full text-left px-3 py-2 text-zinc-300 hover:text-white hover:bg-zinc-700 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer"
                        >
                          ➕ Thêm vào hàng đợi
                        </button>
                        
                        <div className="h-px bg-zinc-700 my-1"></div>
                        
                        <button 
                          onClick={() => handleRemoveTrack(song.id)}
                          className="w-full text-left px-3 py-2 text-red-400 hover:text-red-300 hover:bg-zinc-700 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer"
                        >
                          ❌ Xóa khỏi playlist này
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) ): tracks.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-xs py-16 text-center bg-zinc-900/10 rounded-xl border border-dashed border-zinc-800/60 m-2 animate-fade-in">
            <span className="text-5xl mb-4 animate-bounce">🎵</span>
            <span className="font-black text-sm text-white mb-1">Hiện không có video/nhạc/podcast</span>
            <span className="text-zinc-400 font-medium max-w-xs leading-relaxed">
              Danh sách phát này đang trống. Hãy thêm nội dung bạn yêu thích vào đây.
            </span>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-xs italic py-16 text-center">
            <span className="text-4xl mb-3">🔍</span>
            <span className="text-zinc-400 font-medium">Không có tệp nào khớp với bộ lọc hiện tại của bạn.</span>
          </div>
        )}
      </div>
    </div>
  );
}