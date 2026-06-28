import { useState, useRef, createContext, useEffect, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { type Song } from './types/media';
import { mediaService } from './services/api';
import Home from './pages/Home';
import Playlist from './pages/Playlist';
import ShareInbox from './pages/ShareInbox';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Search from './pages/Search';
import Sidebar from './components/Sidebar';
import PlayerBar from './components/PlayerBar';
import Header from './components/Header';
import VideoPlayer from './pages/VideoPlayer';

export const PlayerContext = createContext<any>(null);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('tune_vault_token');
  const isTokenValid = (token: string) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch { return false; }
  };
  return (token && isTokenValid(token)) ? children : <Navigate to="/login" replace />;
};
const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
const getImgUrl = (path?: string) => path ? (path.startsWith('http') ? path : `${backendUrl}/${path.replace(/\\/g, '/')}`) : '';
function AppContent({
  currentSong, isPlaying, setIsPlaying, rightPanelMode, setRightPanelMode,
  currentTime, setCurrentTime, duration, setDuration, volume, setVolume,
  isLooping, setIsLooping, isShuffling, setIsShuffling,
  mediaRef, togglePlay, mediaStatus, setMediaStatus, pipVideo, setPipVideo,
  setSeekTime, onNext, onPrev
}: any) {
  const location = useLocation();
  const navigate = useNavigate();
  const isLoginPage = location.pathname === '/login';
  const isVideoPage = location.pathname.startsWith('/video/');

  const [showRightShareMenu, setShowRightShareMenu] = useState(false);
  const [showRightAddMenu, setShowRightAddMenu] = useState(false);
  
  const [showDetails, setShowDetails] = useState(true);
  
  const [ownerDisplayName, setOwnerDisplayName] = useState<string | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const addMenuRef = useRef<HTMLDivElement>(null);
  
  // Ref cho Video PiP để đồng bộ Play/Pause với PlayerBar
  const pipRef = useRef<HTMLVideoElement>(null);

  const { 
    librarySongs, toggleLibrarySong, 
    followedArtists, toggleFollowArtist,
    savedPlaylists, playlistTracks, toggleSongInPlaylist 
  } = useContext(PlayerContext);
  
  const isPanelSaved = currentSong && librarySongs?.some((s: any) => s.id === currentSong.id);
  const isFollowing = currentSong && currentSong.ownerUserId && followedArtists?.includes(currentSong.ownerUserId);

  const [pipPos, setPipPos] = useState({ x: window.innerWidth - 320, y: window.innerHeight - 250 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (mediaRef.current) {
      mediaRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    // Đồng bộ PlayerBar (Audio tag)
    if (mediaRef.current) {
      if (isPlaying) {
        mediaRef.current.play().catch((err: any) => {
          console.error("Lỗi tự động phát nhạc:", err);
          setIsPlaying(false);
        });
      } else {
        mediaRef.current.pause();
      }
    }
    // Đồng bộ Video PiP
    if (pipRef.current) {
      if (isPlaying) {
        pipRef.current.play().catch((err: any) => {
          console.error("Lỗi tự động phát PiP:", err);
        });
      } else {
        pipRef.current.pause();
      }
    }
  }, [isPlaying, currentSong, pipVideo, setIsPlaying]);

  const handleSeek = (time: number) => {
    if (mediaRef.current) {
      mediaRef.current.currentTime = time;
    }
    if (pipRef.current) {
      pipRef.current.currentTime = time;
    }
    setCurrentTime(time);
    setSeekTime(time);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowRightShareMenu(false);
      }
      if (addMenuRef.current && !addMenuRef.current.contains(event.target as Node)) {
        setShowRightAddMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setOwnerDisplayName(null); 
    
    (async () => {
      try {
        if (currentSong?.ownerUserId) {
          const u = await mediaService.getUserById(currentSong.ownerUserId);
          setOwnerDisplayName(u?.displayName || u?.displayName || u?.username || u?.username || u?.fullName || u?.fullName || u?.email || null);
        }
      } catch (err) { setOwnerDisplayName(null); }
    })();
  }, [currentSong]);

  useEffect(() => {
    if (showRightShareMenu) {
      const token = localStorage.getItem('tune_vault_token');
      let currentUserId = "-1";
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          currentUserId = String(payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || payload['nameid'] || payload['sub'] || payload['id'] || "-1");
        } catch (e) {}
      }

      mediaService.getAllUsers().then((response: any) => {
        let userList = [];
        if (Array.isArray(response)) {
          userList = response;
        } else if (response && Array.isArray(response.data)) {
          userList = response.data;
        } else if (response && Array.isArray(response.users)) {
          userList = response.users;
        } else if (response && Array.isArray(response.items)) {
          userList = response.items;
        }

        const filteredUsers = userList.filter((u: any) => {
          const uid = u.id || u.userId || u.Id;
          return uid && String(uid) !== currentUserId;
        });
        setUsers(filteredUsers);
      }).catch(e => console.error(e));
    }
  }, [showRightShareMenu]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - pipPos.x,
      y: e.clientY - pipPos.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setPipPos({
          x: e.clientX - dragOffset.current.x,
          y: e.clientY - dragOffset.current.y
        });
      }
    };
    const handleMouseUp = () => setIsDragging(false);

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  if (isLoginPage) {
    return (
      <div className="h-screen bg-black text-white flex items-center justify-center">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-black text-white select-none relative overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden p-2 gap-2 relative">
        
        <aside className="hidden md:flex w-[240px] lg:w-[320px] flex-shrink-0 flex flex-col">
          <Sidebar />
        </aside>
        
        <main className="flex-1 flex flex-col bg-[#121212] overflow-hidden rounded-lg relative custom-scrollbar">
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 pb-24 md:pb-6">
            <div className="max-w-6xl mx-auto w-full h-full">
              <Routes>
                <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/playlist" element={<ProtectedRoute><Playlist /></ProtectedRoute>} />
                <Route path="/share-inbox" element={<ProtectedRoute><ShareInbox /></ProtectedRoute>} />
                <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/search" element={<ProtectedRoute><Search /></ProtectedRoute>} />
                <Route path="/video/:id" element={<ProtectedRoute><VideoPlayer /></ProtectedRoute>} />
              </Routes>
            </div>
          </div>
        </main>

        <aside className={`bg-[#121212] flex flex-col transition-all duration-300 shadow-2xl z-20 rounded-lg overflow-hidden absolute md:relative right-2 top-2 bottom-2 md:right-0 md:top-0 md:bottom-0 ${rightPanelMode === 'info' ? 'w-[240px] lg:w-[320px] opacity-100 translate-x-0' : 'w-0 opacity-0 translate-x-full md:translate-x-0'}`}>
          <div className="w-[240px] lg:w-[320px] h-full flex flex-col">
            <div className="p-4 flex items-center justify-between shrink-0 border-b border-zinc-800/50">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-emerald-500"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                Chi tiết
              </h3>
              <button onClick={() => setRightPanelMode(null)} className="text-zinc-400 hover:text-white w-7 h-7 flex items-center justify-center rounded-full hover:bg-white/10 transition">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar relative">
              <div className="p-4 flex flex-col pb-10">
                {currentSong ? (
                  <>
                  <img 
                    src={getImgUrl(currentSong.thumbnailPath) || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500"} 
                    alt="Bìa" 
                    className="w-full aspect-square object-cover..." 
                  />
                    
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h2 className="text-xl font-bold text-white truncate leading-tight">{currentSong.title}</h2>
                      </div>
                      
                      <div className="flex items-center gap-1 shrink-0">
                        <div className="relative" ref={shareMenuRef}>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setShowRightShareMenu(!showRightShareMenu); }}
                            className={`p-1.5 rounded-full transition cursor-pointer active:scale-95 ${showRightShareMenu ? 'text-emerald-500 bg-white/10' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
                            title="Chia sẻ bài hát"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="w-5 h-5"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                          </button>
                          
                          {showRightShareMenu && (
                            <div className="absolute top-full right-0 mt-2 w-56 bg-[#282828] border border-zinc-700 rounded-xl p-3 shadow-2xl z-50 animate-fade-in text-white cursor-default" onClick={(e) => e.stopPropagation()}>
                              <div className="text-[10px] font-bold text-zinc-400 mb-1.5 px-1 uppercase tracking-wider">Gửi trực tiếp cho:</div>
                              <div className="max-h-36 overflow-y-auto space-y-1 custom-scrollbar">
                                {users.map((u) => {
                                  const uid = u.id || u.userId || u.Id;
                                  const uName = u.displayName || u.DisplayName || u.username || u.UserName || u.fullName || u.FullName || u.email || u.Email || `User #${uid}`;
                                  
                                  return (
                                    <button
                                      key={uid}
                                      onClick={async (e) => {
                                        e.stopPropagation();
                                        try {
                                          await mediaService.shareMedia(currentSong.id, uid);
                                          alert(`Đã gửi "${currentSong.title}" cho ${uName}!`);
                                        } catch (error: any) {
                                          alert(`Lỗi khi chia sẻ: ${error.message || 'Xin vui lòng thử lại sau.'}`);
                                        } finally {
                                          setShowRightShareMenu(false);
                                        }
                                      }}
                                      className="w-full text-left p-2 hover:bg-zinc-700 rounded-lg text-xs font-medium transition flex items-center gap-2 group text-zinc-300 hover:text-white cursor-pointer"
                                    >
                                      <div className="w-6 h-6 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center text-[10px] font-black group-hover:bg-emerald-500 group-hover:text-black shrink-0">
                                        {uName.charAt(0).toUpperCase()}
                                      </div>
                                      <span className="truncate flex-1">{uName}</span>
                                    </button>
                                  );
                                })}
                                {users.length === 0 && (
                                  <p className="text-[10px] text-zinc-500 italic px-1 py-2 text-center">Hệ thống chưa có người dùng khác.</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="relative" ref={addMenuRef}>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setShowRightAddMenu(!showRightAddMenu); }}
                            className={`p-1.5 rounded-full transition transform active:scale-95 cursor-pointer ${showRightAddMenu ? 'text-emerald-500 bg-white/10' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
                            title="Thêm vào..."
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                          </button>
                          
                          {showRightAddMenu && (
                            <div className="absolute top-full right-0 mt-2 w-56 bg-[#282828] border border-zinc-700 rounded-xl p-2 shadow-2xl z-50 text-white animate-fade-in" onClick={(e) => e.stopPropagation()}>
                              <button 
                                onClick={(e) => { e.stopPropagation(); toggleLibrarySong(currentSong.id); setShowRightAddMenu(false); }} 
                                className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 hover:bg-zinc-700 cursor-pointer ${isPanelSaved ? 'text-emerald-400' : 'text-zinc-300 hover:text-white'}`}
                              >
                                Thư Viện Riêng
                              </button>
                              <div className="h-px bg-zinc-700 my-1"></div>
                              <div className="text-[10px] text-zinc-400 font-bold px-2 py-1 uppercase tracking-wider">Danh sách phát hiện có</div>
                              
                              <div className="max-h-32 overflow-y-auto custom-scrollbar">
                                {savedPlaylists?.map((pl: any) => {
                                  const isSaved = playlistTracks?.[pl.id]?.includes(currentSong.id);
                                  return (
                                    <button 
                                      key={pl.id} 
                                      onClick={(e) => { e.stopPropagation(); toggleSongInPlaylist(pl.id, currentSong.id); }} 
                                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition truncate flex items-center gap-2 hover:bg-zinc-700 cursor-pointer ${isSaved ? 'text-emerald-400' : 'text-zinc-300 hover:text-white'}`}
                                    >
                                      {isSaved ? '✓ ' : '+ '} {pl.name}
                                    </button>
                                  );
                                })}
                                {(!savedPlaylists || savedPlaylists.length === 0) && <div className="text-zinc-500 text-[10px] px-2 py-1 italic">Chưa có danh sách phát nào</div>}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/5 border border-zinc-800 rounded-xl p-3 mt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-zinc-400">Thông tin chi tiết</span>
                        <button onClick={() => setShowDetails(!showDetails)} className="text-[11px] font-bold text-emerald-500 hover:text-emerald-400 transition cursor-pointer">
                          {showDetails ? 'Thu gọn' : 'Hiện tất cả'}
                        </button>
                      </div>

                      {showDetails && (
                        <div className="mt-3 pt-3 border-t border-zinc-800 space-y-4 animate-fade-in">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold text-white truncate">{ownerDisplayName || (`Hệ thống TuneVault`)}</p>
                              <p className="text-[10px] font-medium text-zinc-500 mt-0.5">Người đăng</p>
                            </div>
                            <button 
                              onClick={() => toggleFollowArtist(currentSong.ownerUserId)}
                              disabled={!currentSong?.ownerUserId}
                              className={`text-[10px] font-bold px-3 py-1.5 rounded-full transition shrink-0 cursor-pointer border ${isFollowing ? 'border-zinc-600 text-zinc-400 bg-transparent' : 'bg-white text-black border-white hover:bg-zinc-200'} ${!currentSong?.ownerUserId ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {isFollowing ? 'Đang theo dõi' : 'Theo dõi'}
                            </button>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-emerald-400 truncate">{currentSong.genre || 'Chưa phân loại'}</p>
                            <p className="text-[10px] font-medium text-zinc-500 mt-0.5">Thể loại</p>
                          </div>
                          {currentSong.artist && (
                            <div>
                              <p className="text-sm font-bold text-white truncate">{currentSong.artist}</p>
                              <p className="text-[10px] font-medium text-zinc-500 mt-0.5">Tác giả</p>
                            </div>
                          )}
                          
                          <div>
                            <p className="text-sm font-bold text-white truncate">
                              {((currentSong as any).album && String((currentSong as any).album).trim() !== "") ? String((currentSong as any).album) : "Không thuộc album"}
                            </p>
                            <p className="text-[10px] font-medium text-zinc-500 mt-0.5">Album</p>
                          </div>

                          <div>
                            <p className="text-xs font-medium text-zinc-300 line-clamp-3">
                              {(currentSong.description && String(currentSong.description).trim() !== "") ? String(currentSong.description) : "Chưa có description"}
                            </p>
                            <p className="text-[10px] font-medium text-zinc-500 mt-0.5">Mô tả</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-center text-zinc-500 mt-10">Chưa có tệp nào được chọn.</p>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>
      
      {!isVideoPage && currentSong && (
        <PlayerBar 
          currentSong={currentSong} isPlaying={isPlaying} onTogglePlay={togglePlay}
          currentTime={currentTime} duration={duration} onSeek={handleSeek}
          volume={volume} onVolume={setVolume} isLooping={isLooping} onToggleLoop={() => setIsLooping(!isLooping)}
          isShuffling={isShuffling} onToggleShuffle={() => setIsShuffling(!isShuffling)}
          onNext={onNext} onPrev={onPrev}
          rightPanelMode={rightPanelMode} onToggleInfo={() => setRightPanelMode(rightPanelMode === 'info' ? null : 'info')}
          mediaStatus={mediaStatus}
        />
      )}

      {pipVideo && (
        <div 
          style={{ left: `${pipPos.x}px`, top: `${pipPos.y}px` }}
          className="fixed w-72 h-44 bg-[#181818] rounded-xl border border-zinc-800 shadow-2xl z-[9999] overflow-hidden flex flex-col group hover:border-emerald-500/50 transition-colors shadow-black/50"
        >
          <div 
            onMouseDown={handleMouseDown}
            className="bg-zinc-900/90 px-3 py-1.5 flex items-center justify-between border-b border-zinc-800 cursor-move"
          >
            <span className="text-[10px] font-black text-emerald-400 uppercase pointer-events-none">📺 PiP</span>
            <div className="flex items-center gap-2" onMouseDown={(e) => e.stopPropagation()}>
              <button onClick={() => { navigate(`/video/${pipVideo.id}`); setPipVideo(null); }} className="text-[10px] bg-zinc-800 hover:bg-emerald-500 hover:text-black font-bold px-2 py-0.5 rounded transition cursor-pointer">Bung to</button>
              <button onClick={() => setPipVideo(null)} className="text-zinc-400 hover:text-red-400 font-bold text-xs transition px-1 cursor-pointer">✕</button>
            </div>
          </div>
          <div className="flex-1 bg-black relative pointer-events-none">
            {/* THÊM THUỘC TÍNH loop={isLooping} Ở ĐÂY ĐỂ ĐỒNG BỘ VIDEO VÀ AUDIO KHI LẶP LẠI */}
            <video ref={pipRef} src={`/api/Media/${pipVideo.id}/stream`} autoPlay muted loop={isLooping} controls={false} className="w-full h-full object-cover outline-none" />
          </div>
        </div>
      )}

      {currentSong && !isVideoPage && (
        <audio
          ref={mediaRef}
          src={`/api/Media/${currentSong.id}/stream`}
          autoPlay={isPlaying}
          loop={isLooping}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onWaiting={() => setMediaStatus('loading')}
          onPlaying={() => setMediaStatus('playing')}
          onCanPlay={() => setMediaStatus('idle')}
          onError={() => setMediaStatus('error')}
          onEnded={() => {
            if (!isLooping) {
               onNext();
            }
          }}
        />
      )}
    </div>
  );
}

function AppWrapper() {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [rightPanelMode, setRightPanelMode] = useState<'info' | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<any>(null);
  const [pipVideo, setPipVideo] = useState<Song | null>(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isLooping, setIsLooping] = useState(false);
  const [isShuffling, setIsShuffling] = useState(false);
  const [seekTime, setSeekTime] = useState(0);
  const [mediaStatus, setMediaStatus] = useState<'idle' | 'loading' | 'playing' | 'error'>('idle');

  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [librarySongs, setLibrarySongs] = useState<Song[]>([]);
  const [followedArtists, setFollowedArtists] = useState<number[]>([]);
  const [followers, setFollowers] = useState<number[]>([]);
  const [followFilterUserId, setFollowFilterUserId] = useState<number | null>(null);
  const [savedPlaylists, setSavedPlaylists] = useState<any[]>([]);
  const [playlistTracks, setPlaylistTracks] = useState<Record<number, number[]>>({});

  const [globalSongs, setGlobalSongs] = useState<Song[]>([]);

  const mediaRef = useRef<HTMLAudioElement | null>(null);
  const navigate = useNavigate();

  const syncInteractions = async () => {
    if (!localStorage.getItem('tune_vault_token')) return;
    try {
      const [favs, libs, follows, plays, fllwrs, allSongs] = await Promise.all([
        mediaService.getFavorites().catch(() => []),
        mediaService.getLibrarySongs().catch(() => []),
        mediaService.getFollowedArtists().catch(() => []),
        mediaService.getPlaylists().catch(() => []),
        mediaService.getFollowers ? mediaService.getFollowers().catch(() => []) : Promise.resolve([]),
        mediaService.getSongs().catch(() => [])
      ]);

      const tracksMap: Record<number, number[]> = {};
      const populatedPlaylists = await Promise.all(plays.map(async (p: any) => {
        try {
          const tracks = await mediaService.getPlaylistTracks(p.id);
          tracksMap[p.id] = tracks.map((t: any) => t.id);
          return { ...p, tracksCount: tracks.length };
        } catch {
          tracksMap[p.id] = [];
          return p;
        }
      }));

      setLikedSongs(favs);
      setLibrarySongs(libs);
      setFollowedArtists(follows);
      setSavedPlaylists(populatedPlaylists);
      setPlaylistTracks(tracksMap);
      setFollowers(fllwrs);
      setGlobalSongs(allSongs);
      
      window.dispatchEvent(new Event('tune_vault_interactions_updated'));
    } catch { console.error("Lỗi đồng bộ dữ liệu tương tác."); }
  };

  useEffect(() => { syncInteractions(); }, []);

  const toggleLikedSong = async (songId: number) => {
    try {
      await mediaService.toggleFavorite(songId);
      syncInteractions();
    } catch { alert('Thao tác Yêu thích thất bại.'); }
  };

  const toggleLibrarySong = async (songId: number) => {
    try {
      await mediaService.toggleLibrary(songId);
      syncInteractions();
    } catch { alert('Thao tác thêm vào thư viện thất bại.'); }
  };

  const toggleFollowArtist = async (targetUserId: number) => {
    if (!targetUserId) {
      alert('Không tìm thấy ID người dùng để theo dõi.');
      return;
    }
    try {
      await mediaService.toggleFollow(targetUserId);
      syncInteractions();
    } catch { alert('Thao tác Theo dõi người dùng thất bại.'); }
  };

  const toggleSavePlaylist = (playlist: any) => {
    setSavedPlaylists(prev => {
      const exists = prev.some(p => p.id === playlist.id);
      return exists ? prev.filter(p => p.id !== playlist.id) : [...prev, playlist];
    });
  };

  const toggleSongInPlaylist = async (playlistId: number, songId: number) => {
    try {
      const currentTracks = playlistTracks[playlistId] || [];
      const exists = currentTracks.includes(songId);
      if (exists) {
        await mediaService.removeTrackFromPlaylist(playlistId, songId);
      } else {
        await mediaService.addTrackToPlaylist(playlistId, songId);
      }
      const updated = await mediaService.getPlaylistTracks(playlistId);
      setPlaylistTracks(prev => ({ ...prev, [playlistId]: updated.map(t => t.id) }));
      setSavedPlaylists(prev => prev.map((p: any) => p.id === playlistId ? { ...p, tracksCount: (updated || []).length } : p));
      window.dispatchEvent(new Event('playlist_tracks_updated'));
    } catch { alert('Lỗi chỉnh sửa danh sách phát.'); }
  };

  const handleSelectMedia = async (song: Song, playlistContext?: any) => {
    let freshSong = song;
    try {
      const fetched = await mediaService.getMediaById(song.id);
      if (fetched) {
        freshSong = fetched;
      }
    } catch (err) {
      console.warn("Không lấy được dữ liệu mới từ API, dùng dữ liệu cục bộ.", err);
    }

    setCurrentSong(freshSong);
    setRightPanelMode('info');

    if (freshSong.mediaType === 'Video') {
      if (mediaRef.current) mediaRef.current.pause();
      setIsPlaying(false);
      navigate(`/video/${freshSong.id}`);
      try {
        await mediaService.addHistoryItem({ mediaItemId: freshSong.id });
      } catch { console.error("Lỗi cập nhật lịch sử nghe."); }
      return;
    }
    
    try {
      if (window.location.pathname.startsWith('/video/')) {
        navigate('/');
      }
    } catch {}

    setPipVideo(null);
    setIsPlaying(true);
    setMediaStatus('loading');
    if (playlistContext) setSelectedPlaylist(playlistContext);

    try {
      await mediaService.addHistoryItem({ mediaItemId: freshSong.id });
    } catch { console.error("Lỗi cập nhật lịch sử nghe."); }
  };

  const handleNext = async () => {
    if (!currentSong) return;
    let queue = globalSongs;

    if (selectedPlaylist) {
      if (selectedPlaylist.id === 'liked-playlist') {
        queue = likedSongs;
      } else {
        try {
          queue = await mediaService.getPlaylistTracks(selectedPlaylist.id);
        } catch {}
      }
    }

    if (!queue || queue.length === 0) queue = globalSongs;

    if (isShuffling) {
      const randomIdx = Math.floor(Math.random() * queue.length);
      handleSelectMedia(queue[randomIdx], selectedPlaylist);
      return;
    }

    if (selectedPlaylist) {
      const currentIndex = queue.findIndex(s => s.id === currentSong.id);
      let nextIndex = currentIndex + 1;
      if (nextIndex >= queue.length) nextIndex = 0;
      handleSelectMedia(queue[nextIndex], selectedPlaylist);
    } else {
      const sortedQueue = [...queue].sort((a, b) => a.id - b.id);
      const currentIndex = sortedQueue.findIndex(s => s.id === currentSong.id);
      let nextIndex = currentIndex + 1;
      if (nextIndex >= sortedQueue.length) nextIndex = 0;
      handleSelectMedia(sortedQueue[nextIndex], null);
    }
  };

  const handlePrev = async () => {
    if (!currentSong) return;
    let queue = globalSongs;

    if (selectedPlaylist) {
      if (selectedPlaylist.id === 'liked-playlist') {
        queue = likedSongs;
      } else {
        try {
          queue = await mediaService.getPlaylistTracks(selectedPlaylist.id);
        } catch {}
      }
    }

    if (!queue || queue.length === 0) queue = globalSongs;

    if (isShuffling) {
      const randomIdx = Math.floor(Math.random() * queue.length);
      handleSelectMedia(queue[randomIdx], selectedPlaylist);
      return;
    }

    if (selectedPlaylist) {
      const currentIndex = queue.findIndex(s => s.id === currentSong.id);
      let prevIndex = currentIndex - 1;
      if (prevIndex < 0) prevIndex = queue.length - 1;
      handleSelectMedia(queue[prevIndex], selectedPlaylist);
    } else {
      const sortedQueue = [...queue].sort((a, b) => a.id - b.id);
      const currentIndex = sortedQueue.findIndex(s => s.id === currentSong.id);
      let prevIndex = currentIndex - 1;
      if (prevIndex < 0) prevIndex = sortedQueue.length - 1;
      handleSelectMedia(sortedQueue[prevIndex], null);
    }
  };

  useEffect(() => {
    try {
      if (mediaRef.current && mediaRef.current.readyState > 0 && seekTime !== mediaRef.current.currentTime) {
        mediaRef.current.currentTime = seekTime;
      }
    } catch (error) {
      console.warn("Audio chưa sẵn sàng để tua:", error);
    }
  }, [seekTime, currentSong]);

  const togglePlay = () => setIsPlaying(!isPlaying);

  return (
    <PlayerContext.Provider value={{ 
      currentSong, isPlaying, setIsPlaying, handleSelectMedia, togglePlay, 
      setRightPanelMode, selectedPlaylist, setSelectedPlaylist, pipVideo, setPipVideo,
      setCurrentTime, setDuration, volume, isLooping, seekTime, setSeekTime,
      likedSongs, toggleLikedSong, librarySongs, toggleLibrarySong, followedArtists, toggleFollowArtist,
      followers, 
      savedPlaylists, toggleSavePlaylist, playlistTracks, toggleSongInPlaylist,
      followFilterUserId, setFollowFilterUserId,
      setSavedPlaylists,
      setLibrarySongs, setLikedSongs
    }}>
      <AppContent 
        currentSong={currentSong} isPlaying={isPlaying} setIsPlaying={setIsPlaying} rightPanelMode={rightPanelMode} setRightPanelMode={setRightPanelMode}
        currentTime={currentTime} setCurrentTime={setCurrentTime} duration={duration} setDuration={setDuration} volume={volume} setVolume={setVolume}
        isLooping={isLooping} setIsLooping={setIsLooping} isShuffling={isShuffling} setIsShuffling={setIsShuffling}
        mediaRef={mediaRef} handleSelectMedia={handleSelectMedia} togglePlay={togglePlay}
        mediaStatus={mediaStatus} setMediaStatus={setMediaStatus} pipVideo={pipVideo} setPipVideo={setPipVideo}
        setSeekTime={setSeekTime} onNext={handleNext} onPrev={handlePrev}
      />
    </PlayerContext.Provider>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppWrapper />
    </BrowserRouter>
  );
}

export default App;