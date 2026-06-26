import React, { useState, useEffect, useRef, useContext } from 'react';
import { type Song } from '../types/media';
import { PlayerContext } from '../App';

interface PlayerBarProps {
  currentSong: Song | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  volume: number;
  onVolume: (volume: number) => void;
  isLooping: boolean;
  onToggleLoop: () => void;
  isShuffling: boolean;
  onToggleShuffle: () => void;
  onNext: () => void;
  onPrev: () => void;
  rightPanelMode: 'info' | null;
  onToggleInfo: () => void;
  mediaStatus?: 'idle' | 'loading' | 'playing' | 'error';
}

const formatTime = (time: number) => {
  if (isNaN(time)) return "0:00";
  const mins = Math.floor(time / 60);
  const secs = Math.floor(time % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const PlayerBar: React.FC<PlayerBarProps> = ({
  currentSong,
  isPlaying,
  onTogglePlay,
  currentTime,
  duration,
  onSeek,
  volume,
  onVolume,
  isLooping,
  onToggleLoop,
  isShuffling,
  onToggleShuffle,
  onNext,
  onPrev,
  rightPanelMode,
  onToggleInfo,
  mediaStatus = 'idle'
}) => {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const addMenuRef = useRef<HTMLDivElement>(null);

  const { 
    likedSongs, toggleLikedSong, 
    librarySongs, toggleLibrarySong,
    savedPlaylists, playlistTracks, toggleSongInPlaylist
  } = useContext(PlayerContext) || {};

  const isLiked = (currentSong && Array.isArray(likedSongs)) ? likedSongs.some((s: any) => s.id === currentSong.id) : false;
  const isSavedToLibrary = (currentSong && Array.isArray(librarySongs)) ? librarySongs.some((s: any) => s.id === currentSong.id) : false;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(event.target as Node)) {
        setShowAddMenu(false);
      }
    };
    if (showAddMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAddMenu]);

  useEffect(() => {
    setShowAddMenu(false);
  }, [currentSong?.id]);

  const handleLikeToggle = () => {
    if (!currentSong) return;
    if (toggleLikedSong) toggleLikedSong(currentSong.id);
  };

  return (
    <div className="h-20 bg-[#121212] border-t border-zinc-900 px-2 sm:px-4 flex items-center justify-between select-none shadow-2xl relative z-40">
      
      <div className="flex items-center gap-3 w-[60%] sm:w-full md:w-[30%] min-w-[150px] md:min-w-[280px] relative">
        {currentSong ? (
          <>
            <div className="w-11 h-11 bg-zinc-800 rounded-md overflow-hidden flex-shrink-0 shadow border border-zinc-800 relative hidden sm:block">
              {currentSong.thumbnailPath ? (
                <img src={currentSong.thumbnailPath} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-lg">🎵</div>
              )}
              {mediaStatus === 'loading' && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1 relative">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-xs font-black text-white truncate hover:underline cursor-pointer max-w-[120px] sm:max-w-[160px]" title={currentSong?.title}>
                  {currentSong.title}
                </p>
                
                <div className="relative flex items-center" ref={addMenuRef}>
                  <button 
                    onClick={() => setShowAddMenu(!showAddMenu)} 
                    className={`transition transform active:scale-90 p-1 rounded-full cursor-pointer ${showAddMenu ? 'text-emerald-500 bg-white/10' : 'text-zinc-400 hover:text-white'}`} 
                    title="Thêm vào..."
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="12" y1="8" x2="12" y2="16"></line>
                      <line x1="8" y1="12" x2="16" y2="12"></line>
                    </svg>
                  </button>
                  
                  {showAddMenu && (
                    <div className="absolute bottom-full left-0 mb-2 w-56 bg-[#282828] border border-zinc-700 rounded-xl p-2 shadow-2xl z-50 text-white animate-fade-in">
                      <button 
                        onClick={() => toggleLibrarySong && toggleLibrarySong(currentSong.id)} 
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 hover:bg-zinc-700 ${isSavedToLibrary ? 'text-emerald-400' : 'text-zinc-300 hover:text-white'}`}
                      >
                        Thư Viện Riêng
                      </button>
                      <div className="h-px bg-zinc-700 my-1"></div>
                      <div className="text-[10px] text-zinc-400 font-bold px-2 py-1 uppercase tracking-wider">Danh sách phát hiện có</div>
                      
                      <div className="max-h-32 overflow-y-auto custom-scrollbar">
                        {Array.isArray(savedPlaylists) && savedPlaylists.map((pl: any) => {
                          const isSaved = playlistTracks?.[pl.id]?.includes(currentSong.id);
                          return (
                            <button 
                              key={pl.id} 
                              onClick={() => toggleSongInPlaylist && toggleSongInPlaylist(pl.id, currentSong.id)} 
                              className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition truncate flex items-center gap-2 hover:bg-zinc-700 ${isSaved ? 'text-emerald-400' : 'text-zinc-300 hover:text-white'}`}
                            >
                              {isSaved ? '✓ ' : '+ '} {pl.name}
                            </button>
                          );
                        })}
                        {(!savedPlaylists || !Array.isArray(savedPlaylists) || savedPlaylists.length === 0) && (
                          <div className="text-zinc-500 text-[10px] px-2 py-1 italic">Chưa có danh sách phát nào</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button onClick={handleLikeToggle} className={`transition transform active:scale-90 p-1 rounded-full cursor-pointer ${isLiked ? 'text-emerald-500' : 'text-zinc-400 hover:text-white'}`}>
                    <svg viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-0.5 max-w-full">
                <p className="text-[10px] text-zinc-400 truncate max-w-[80px] sm:max-w-[120px]">{currentSong.artist || "Unknown Artist"}</p>
              </div>
            </div>
          </>
        ) : (
          <div className="text-zinc-600 text-xs italic font-medium px-2 truncate">Không có nội dung đang phát</div>
        )}
      </div>

      <div className="hidden sm:flex flex-col items-center gap-1.5 w-[40%] max-w-xl">
        <div className="flex items-center gap-5 text-zinc-400">
          <button onClick={onToggleShuffle} className={`transition cursor-pointer active:scale-95 ${isShuffling ? 'text-emerald-500' : 'hover:text-white'}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polyline points="16 3 21 3 21 8"></polyline><line x1="4" y1="20" x2="21" y2="3"></line><polyline points="21 16 21 21 16 21"></polyline><line x1="15" y1="15" x2="21" y2="21"></line><line x1="4" y1="4" x2="9" y2="9"></line></svg>
          </button>
          <button onClick={onPrev} className="hover:text-white transition cursor-pointer active:scale-90">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><polygon points="19 20 9 12 19 4 19 20"></polygon><line x1="5" y1="19" x2="5" y2="5"></line></svg>
          </button>
          <button onClick={onTogglePlay} disabled={!currentSong} className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 active:scale-95 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
            {isPlaying ? (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-black"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-black translate-x-0.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
            )}
          </button>
          <button onClick={onNext} className="hover:text-white transition cursor-pointer active:scale-90">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>
          </button>
          <button onClick={onToggleLoop} className={`transition cursor-pointer active:scale-95 ${isLooping ? 'text-emerald-500' : 'hover:text-white'}`}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>
          </button>
        </div>
        <div className="w-full flex items-center gap-2 text-[10px] text-zinc-400 font-medium">
          <span className="w-7 text-right">{formatTime(currentTime)}</span>
          <input type="range" min={0} max={duration || 100} value={currentTime} onChange={(e) => onSeek(Number(e.target.value))} disabled={!currentSong} className="flex-1 h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-white hover:accent-emerald-500 transition outline-none disabled:opacity-50" />
          <span className="w-7 text-left">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="hidden md:flex items-center justify-end gap-3 w-[30%] min-w-[200px] text-zinc-400">
        <div className="flex items-center gap-2 group">
          <button onClick={() => onVolume(volume === 0 ? 0.5 : 0)} className="hover:text-white transition cursor-pointer">
            {volume === 0 ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
            ) : volume < 0.5 ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
            )}
          </button>
          <input type="range" min={0} max={1} step={0.01} value={volume} onChange={(e) => onVolume(Number(e.target.value))} className="w-16 md:w-20 lg:w-24 h-1 bg-zinc-600 rounded-full appearance-none cursor-pointer accent-white group-hover:accent-emerald-500 transition outline-none" />
        </div>
        <div className="w-px h-5 bg-zinc-800 mx-1"></div>
        <button onClick={onToggleInfo} className={`transition p-1 cursor-pointer active:scale-90 ${rightPanelMode === 'info' ? 'text-emerald-500' : 'text-zinc-400 hover:text-white'}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="15" y1="3" x2="15" y2="21"></line></svg>
        </button>
      </div>

      <div className="flex sm:hidden items-center justify-end gap-2 pr-1">
        <button onClick={onTogglePlay} disabled={!currentSong} className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center transition cursor-pointer">
          {isPlaying ? (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 translate-x-0.5"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
          )}
        </button>
        <button onClick={onNext} className="text-zinc-400 hover:text-white transition p-1 cursor-pointer">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><polygon points="5 4 15 12 5 20 5 4"></polygon><line x1="19" y1="5" x2="19" y2="19"></line></svg>
        </button>
      </div>

    </div>
  );
};

export default PlayerBar;