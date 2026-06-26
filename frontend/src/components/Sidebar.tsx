import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { mediaService } from '../services/api';
import { PlayerContext } from '../App';
import CreatePlaylistModal from './CreatePlaylistModal';

// Hàm hỗ trợ format thời gian thân thiện (Vừa xong, x phút trước...)
const formatPlayedTime = (dateString?: string) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    const diffInSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Vừa xong';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} ngày trước`;
    
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return '';
  }
};

function FollowUserButton({ userId, onClick, isActive }: { userId: number, onClick: () => void, isActive?: boolean }) {
  const [user, setUser] = React.useState<any>(null);
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const u = await mediaService.getUserById(userId);
        if (mounted) setUser(u);
      } catch { if (mounted) setUser(null); }
    })();
    return () => { mounted = false; };
  }, [userId]);

  const name = user?.displayName || user?.DisplayName || user?.fullName || user?.FullName || user?.username || user?.email || `User#${userId}`;
  const avatar = user?.avatarUrl || user?.avatarPath || user?.thumbnailPath || null;

  return (
    <button onClick={onClick} className={`w-28 p-2 rounded-2xl bg-[#181818] border transition text-left cursor-pointer shrink-0 ${isActive ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)] bg-emerald-900/20' : 'border-zinc-800 hover:border-emerald-500/40'}`}>
      <div className="w-full h-20 rounded-2xl bg-zinc-900 overflow-hidden mb-2 relative">
        {avatar ? <img src={avatar} alt={name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-sm text-zinc-400">{name.charAt(0).toUpperCase()}</div>}
        {isActive && <div className="absolute inset-0 bg-emerald-500/10 pointer-events-none"></div>}
      </div>
      <div className={`text-[11px] font-bold leading-tight line-clamp-2 ${isActive ? 'text-emerald-400' : 'text-white'}`}>{name}</div>
    </button>
  );
}

export default function Sidebar() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [libraryFilter, setLibraryFilter] = useState<'All' | 'Playlist' | 'Audio' | 'Video' | 'Follow'>('All');
  const [activeTab, setActiveTab] = useState<'library' | 'history'>('library');
  const [historyItems, setHistoryItems] = useState<any[]>([]);

  const { 
    currentSong, 
    selectedPlaylist, setSelectedPlaylist, handleSelectMedia, likedSongs,
    savedPlaylists, toggleSavePlaylist, librarySongs,
    followedArtists, followers, followFilterUserId, setFollowFilterUserId
  } = useContext(PlayerContext) || {};
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname !== '/playlist' && !location.pathname.startsWith('/video')) {
      if (setSelectedPlaylist) setSelectedPlaylist(null);
    }
  }, [location.pathname, setSelectedPlaylist]);

  const loadHistory = async () => {
    try {
      const data = await mediaService.getHistory();
      setHistoryItems(data || []);
    } catch {
      setHistoryItems([]);
    }
  };

  useEffect(() => { 
    loadHistory();
    const handleHistoryUpdate = () => loadHistory();
    window.addEventListener('tune_vault_history_updated', handleHistoryUpdate);
    return () => window.removeEventListener('tune_vault_history_updated', handleHistoryUpdate);
  }, []);

  const handleCreatePlaylist = async (name: string, description: string) => {
    try {
      const newPlaylist = await mediaService.createPlaylist({ name, description });
      if (toggleSavePlaylist) toggleSavePlaylist(newPlaylist);
      setShowCreateModal(false);
    } catch {
      alert('Tạo playlist thất bại.');
    }
  };

  const handleRemovePlaylist = (e: React.MouseEvent, playlist: any) => {
    e.stopPropagation();
    if (window.confirm(`Bạn có chắc chắn muốn xóa "${playlist.name}" khỏi thư viện?`)) {
      if (toggleSavePlaylist) toggleSavePlaylist(playlist);
      if (selectedPlaylist?.id === playlist.id) {
         navigate('/');
      }
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử nghe/xem không? Thao tác này không thể hoàn tác.")) {
      try {
        await mediaService.clearHistory();
        setHistoryItems([]);
        window.dispatchEvent(new Event('tune_vault_history_updated'));
      } catch {
        alert("Xóa lịch sử thất bại. Vui lòng kiểm tra lại kết nối.");
      }
    }
  };

  const filteredPlaylists = (savedPlaylists || []).filter((p: any) => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLibrarySongs = (librarySongs || []).filter((s: any) => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (s.artist && s.artist.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!matchesSearch) return false;
    if (libraryFilter === 'All' || libraryFilter === 'Playlist' || libraryFilter === 'Follow') return true;
    return s.mediaType === libraryFilter;
  });

  return (
    <aside className="flex-1 bg-[#121212] p-2 rounded-lg flex flex-col min-h-0 select-none">
      
      <div className="px-3 py-3 flex items-center justify-between shrink-0 border-b border-zinc-800/50 mb-2">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setActiveTab('library')}
            className={`flex items-center gap-2 font-bold transition px-3 py-1.5 rounded-full cursor-pointer ${activeTab === 'library' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
            Thư viện
          </button>
          
          <button 
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 font-bold transition px-3 py-1.5 rounded-full cursor-pointer ${activeTab === 'history' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-5 h-5 transition-transform duration-300 ${activeTab === 'history' ? 'rotate-[-15deg]' : ''}`}>
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
              <path d="M12 7v5l4 2" />
            </svg>
            Lịch sử
          </button>
        </div>

        {activeTab === 'library' && (
          <button 
            onClick={() => setShowCreateModal(true)}
            className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/5 rounded-full transition cursor-pointer"
            title="Tạo danh sách phát mới"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          </button>
        )}
      </div>

      {activeTab === 'library' && (
        <div className="px-2 pb-2 flex gap-2 overflow-x-auto custom-scrollbar shrink-0 mb-1">
          {['All', 'Playlist', 'Audio', 'Video', 'Follow'].map((filter) => (
            <button
              key={filter}
              onClick={() => setLibraryFilter(filter as any)}
              className={`px-3 py-1 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors cursor-pointer ${
                libraryFilter === filter ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {filter === 'All' ? 'Tất cả' : filter === 'Audio' ? 'Bài hát' : filter}
            </button>
          ))}
        </div>
      )}

      {activeTab === 'library' ? (
        <>
          <div className="px-2 mb-2 flex items-center gap-2 shrink-0">
            <div className="relative flex-1">
              <input 
                type="text"
                placeholder="Tìm trong thư viện"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/10 text-white text-xs pl-8 pr-3 py-1.5 rounded outline-none placeholder-zinc-400 focus:bg-white/20 transition"
              />
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 px-2 space-y-1 pb-4">
            
            {(libraryFilter === 'All' || libraryFilter === 'Playlist') && (
              <>
                <div 
                  onClick={() => {
                    if (setSelectedPlaylist) setSelectedPlaylist({
                      id: 'liked-playlist',
                      name: 'Bài hát yêu thích',
                      description: 'Danh sách các bài hát bạn đã thả tim trong hệ thống.',
                      isPublic: false,
                      createdAt: new Date().toISOString(),
                      tracksCount: likedSongs?.length || 0,
                      isSpecial: true
                    });
                    navigate('/playlist');
                  }}
                  className={`p-2 rounded-md cursor-pointer transition flex items-center gap-3 group mb-1 ${
                    selectedPlaylist?.id === 'liked-playlist' ? 'bg-white/10 border border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="w-12 h-12 rounded bg-gradient-to-br from-emerald-500 to-emerald-900 flex items-center justify-center text-xl shrink-0 shadow-sm border border-emerald-500/20">
                    💚
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-bold truncate ${selectedPlaylist?.id === 'liked-playlist' ? 'text-emerald-500' : 'text-white'}`}>
                      Bài hát yêu thích
                    </p>
                    <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                      Danh sách tự động • {likedSongs?.length || 0} bài
                    </p>
                  </div>
                </div>

                {filteredPlaylists.length > 0 ? (
                  filteredPlaylists.map((p: any) => {
                    const isSelected = selectedPlaylist?.id === p.id;
                    return (
                      <div 
                        key={p.id}
                        onClick={() => {
                          if (setSelectedPlaylist) setSelectedPlaylist(p);
                          navigate('/playlist');
                        }}
                        className={`p-2 rounded-md cursor-pointer transition flex items-center justify-between group border ${
                          isSelected ? 'bg-white/10 border-emerald-500/50 shadow-[0_0_10px_rgba(16,185,129,0.1)]' : 'hover:bg-white/5 border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div className={`w-12 h-12 rounded flex items-center justify-center text-xl shrink-0 shadow-sm ${isSelected ? 'bg-emerald-600' : 'bg-gradient-to-br from-zinc-800 to-zinc-900'}`}>
                            🎶
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className={`text-sm font-bold truncate ${isSelected ? 'text-emerald-500' : 'text-white'}`}>
                              {p.name}
                            </p>
                            <p className="text-xs text-zinc-400 truncate mt-0.5">
                              Playlist • {p.tracksCount ?? 0} bài
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={(e) => handleRemovePlaylist(e, p)}
                          className="opacity-0 group-hover:opacity-100 p-2 text-zinc-500 hover:text-white hover:bg-red-500/80 transition-all ml-2 shrink-0 rounded-lg cursor-pointer"
                          title="Xóa khỏi thư viện"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><path d="M18 6L6 18M6 6l12 12"/></svg>
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-zinc-600 text-[11px] mt-4 mb-4">Chưa có playlist tùy chỉnh.</p>
                )}
              </>
            )}

            {((libraryFilter === 'All' || libraryFilter === 'Follow') && followedArtists && followedArtists.length > 0) && (
              <div className="px-1 mb-2 mt-4">
                <div className="flex flex-col gap-2 mb-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-zinc-400 uppercase">Following</p>
                    {followFilterUserId && followedArtists.includes(followFilterUserId) && (
                      <button onClick={() => setFollowFilterUserId && setFollowFilterUserId(null)} className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 border border-red-500/20 transition-all cursor-pointer flex items-center gap-1 shadow-sm">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        Hủy lọc
                      </button>
                    )}
                  </div>
                  {followFilterUserId && followedArtists.includes(followFilterUserId) && (
                    <p className="text-[10px] text-emerald-300">Đang lọc theo người bạn theo dõi.</p>
                  )}
                </div>
                <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
                  {followedArtists.map((uid: number) => (
                    <FollowUserButton 
                      key={`follow-${uid}`} 
                      userId={uid} 
                      isActive={followFilterUserId === uid}
                      onClick={() => { setFollowFilterUserId && setFollowFilterUserId(uid); if (setSelectedPlaylist) setSelectedPlaylist(null); navigate('/'); }} 
                    />
                  ))}
                </div>
              </div>
            )}

            {((libraryFilter === 'All' || libraryFilter === 'Follow') && followers && followers.length > 0) && (
              <div className="px-1 mb-4 mt-2 border-t border-zinc-800/60 pt-4">
                <div className="flex flex-col gap-2 mb-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-zinc-400 uppercase">Follower</p>
                    {followFilterUserId && followers.includes(followFilterUserId) && !followedArtists.includes(followFilterUserId) && (
                      <button onClick={() => setFollowFilterUserId && setFollowFilterUserId(null)} className="text-[10px] font-bold px-3 py-1.5 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300 border border-red-500/20 transition-all cursor-pointer flex items-center gap-1 shadow-sm">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        Hủy lọc
                      </button>
                    )}
                  </div>
                  {followFilterUserId && followers.includes(followFilterUserId) && !followedArtists.includes(followFilterUserId) && (
                    <p className="text-[10px] text-emerald-300">Đang lọc theo người theo dõi bạn.</p>
                  )}
                </div>
                <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
                  {followers.map((uid: number) => (
                    <FollowUserButton 
                      key={`follower-${uid}`} 
                      userId={uid} 
                      isActive={followFilterUserId === uid}
                      onClick={() => { setFollowFilterUserId && setFollowFilterUserId(uid); if (setSelectedPlaylist) setSelectedPlaylist(null); navigate('/'); }} 
                    />
                  ))}
                </div>
              </div>
            )}

            {(libraryFilter === 'All' || libraryFilter === 'Audio' || libraryFilter === 'Video') && (
              <div className="space-y-1 border-t border-zinc-800/60 pt-3 mt-2">
                <p className="text-[10px] font-black text-zinc-500 px-2 uppercase tracking-wider mb-1.5">
                  Tệp âm thanh & video lẻ ({filteredLibrarySongs.length})
                </p>
                
                {filteredLibrarySongs.length > 0 ? (
                  filteredLibrarySongs.map((song: any) => {
                    const isActive = currentSong?.id === song.id;
                    return (
                      <div
                        key={`sidebar-song-${song.id}`}
                        onClick={() => handleSelectMedia && handleSelectMedia(song)}
                        className={`flex items-center justify-between p-2 rounded-md transition group cursor-pointer border ${
                          isActive 
                            ? 'bg-emerald-900/20 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.15)]' 
                            : 'hover:bg-white/5 border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {song.thumbnailPath ? (
                            <img 
                              src={song.thumbnailPath} 
                              alt="" 
                              className={`w-11 h-11 rounded object-cover shrink-0 shadow-sm border ${isActive ? 'border-emerald-500' : 'border-zinc-800'}`} 
                            />
                          ) : (
                            <div className={`w-11 h-11 rounded flex items-center justify-center text-base shrink-0 shadow-sm border ${isActive ? 'bg-emerald-900/40 border-emerald-500 text-emerald-400' : 'bg-zinc-800 border-zinc-800'}`}>
                              {song.mediaType === 'Video' ? '🎬' : '🎵'}
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className={`text-xs font-bold truncate transition ${isActive ? 'text-emerald-400' : 'text-white group-hover:text-emerald-400'}`}>
                              {song.title}
                            </p>
                            <p className="text-[11px] text-zinc-500 truncate mt-0.5">
                              {song.artist || "Unknown Artist"} • {song.mediaType === 'Video' ? 'Video' : 'Audio'}
                            </p>
                          </div>
                        </div>
                        {isActive && (
                          <div className="shrink-0 flex items-end gap-0.5 ml-2">
                            <span className="w-1 bg-emerald-500 h-2 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-1 bg-emerald-500 h-3 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-1 bg-emerald-500 h-1.5 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-zinc-600 text-[11px] italic pt-2">Không có tệp lẻ nào phù hợp.</p>
                )}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between px-3 py-1 mb-1 border-b border-zinc-800/50">
             <p className="text-[10px] font-black text-zinc-500 uppercase tracking-wider">Đã phát gần đây</p>
             {historyItems.length > 0 && (
               <button 
                 onClick={handleClearHistory} 
                 className="text-[10px] font-bold bg-red-500/10 text-red-400 hover:bg-red-500/20 px-2 py-1 rounded transition cursor-pointer"
               >
                 Xóa tất cả
               </button>
             )}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 px-2 space-y-1 pt-1">
            {historyItems.length > 0 ? (
              historyItems.map((item, index) => {
                if (item.type === 'playlist') {
                  const p = item.data;
                  const isSelected = selectedPlaylist?.id === p.id;
                  return (
                    <div
                      key={`hist-p-${p.id}-${index}`}
                      className={`flex items-center justify-between p-2 rounded-md transition group cursor-pointer border ${
                        isSelected ? 'bg-white/10 border-emerald-500/40' : 'hover:bg-white/5 border-transparent'
                      }`}
                    >
                      <div 
                        className="flex items-center gap-3 min-w-0 flex-1"
                        onClick={() => {
                          if (setSelectedPlaylist) setSelectedPlaylist(p);
                          navigate('/playlist');
                        }}
                      >
                        <div className="w-12 h-12 rounded bg-gradient-to-br from-emerald-800 to-zinc-900 flex items-center justify-center text-xl shrink-0 shadow-sm border border-emerald-900/50">
                          🗂️
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-bold truncate ${isSelected ? 'text-emerald-500' : 'text-white group-hover:text-emerald-400'} transition`}>
                            {p.name}
                          </p>
                          <div className="flex items-center justify-between mt-0.5">
                            <p className="text-[11px] text-zinc-500 truncate">
                              Danh sách phát • Gần đây
                            </p>
                            {item.playedAt && (
                              <span className="text-[10px] text-zinc-600 shrink-0 ml-2">{formatPlayedTime(item.playedAt)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                const song = item.data || item;
                const isActive = currentSong?.id === song.id;
                
                return (
                  <div
                    key={`hist-m-${song.id}-${index}`}
                    className={`flex items-center justify-between p-2 rounded-md transition group cursor-pointer border ${
                        isActive ? 'bg-emerald-900/20 border-emerald-500/40' : 'hover:bg-white/5 border-transparent'
                    }`}
                  >
                    <div 
                      className="flex items-center gap-3 min-w-0 flex-1"
                      onClick={() => {
                        if (handleSelectMedia) handleSelectMedia(song);
                      }}
                    >
                      {song.thumbnailPath ? (
                        <img 
                          src={song.thumbnailPath} 
                          alt={song.title} 
                          className="w-12 h-12 rounded object-cover shrink-0 shadow-sm" 
                        />
                      ) : (
                        <div className="w-12 h-12 rounded bg-zinc-800 flex items-center justify-center text-lg shrink-0 shadow-sm">
                          {song.mediaType === 'Video' ? '🎬' : '🎵'}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm font-bold truncate transition ${isActive ? 'text-emerald-400' : 'text-white group-hover:text-emerald-400'}`}>
                          {song.title}
                        </p>
                        <div className="flex items-center justify-between mt-0.5">
                          <p className="text-[11px] text-zinc-500 truncate">
                            {song.artist || "Unknown Artist"} • {song.mediaType === 'Video' ? 'Video' : 'Audio'}
                          </p>
                          {song.playedAt && (
                            <span className="text-[10px] text-zinc-600 shrink-0 ml-2">{formatPlayedTime(song.playedAt)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-center text-zinc-500 text-sm mt-8 italic">Chưa có lịch sử hoạt động.</p>
            )}
          </div>
        </>
      )}

      {showCreateModal && (
        <CreatePlaylistModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreatePlaylist}
        />
      )}
    </aside>
  );
}