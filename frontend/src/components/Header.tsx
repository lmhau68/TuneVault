import React, { useState, useEffect, useRef, useContext } from 'react';
import UploadModal from './UploadModal';
import { useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom';
import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr';
import { mediaService } from '../services/api';
import { type NotificationItem, type Song } from '../types/media';
import { PlayerContext } from '../App';

interface SearchGroupResults {
  tracks: Song[];
  playlists: any[];
  artists: any[];
}

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
  const getImgUrl = (path?: string) => path ? (path.startsWith('http') ? path : `${backendUrl}/${path.replace(/\\/g, '/')}`) : '';
  const [searchParams, setSearchParams] = useSearchParams();
  const queryFromUrl = searchParams.get('q') || '';
  
  const [searchVal, setSearchVal] = useState('');
  const [searchResults, setSearchResults] = useState<SearchGroupResults>({ tracks: [], playlists: [], artists: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const { handleSelectMedia, setSelectedPlaylist } = useContext(PlayerContext) || {};

  const searchContainerRef = useRef<HTMLFormElement>(null);
  const notifContainerRef = useRef<HTMLDivElement>(null);
  const uploadContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (location.pathname === '/search') {
      setSearchVal(queryFromUrl);
      setShowSearchDropdown(false); 
    } else {
      setSearchVal(''); 
    }
  }, [queryFromUrl, location.pathname]);

  const fetchInitialNotifications = async () => {
    if (!localStorage.getItem('tune_vault_token')) return;
    try {
      const data = await mediaService.getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch { console.error("Không thể lấy thông báo qua API."); }
  };

  useEffect(() => {
    fetchInitialNotifications();

    let connection: HubConnection | null = null;
    if (localStorage.getItem('tune_vault_token')) {
      try {
        connection = new HubConnectionBuilder()
          .withUrl("/hubs/notifications", {
            accessTokenFactory: () => localStorage.getItem('tune_vault_token') || ''
          })
          .withAutomaticReconnect()
          .build();

        connection.start()
          .then(() => {
            connection?.on("ReceiveNotification", (notif: NotificationItem) => {
              setNotifications(prev => [notif, ...prev]);
            });
          })
          .catch(err => console.error("SignalR Connection Error: ", err));
      } catch (err) {
        console.error("SignalR Init Error: ", err);
      }
    }

    return () => {
      if (connection) {
        connection.off("ReceiveNotification");
        connection.stop();
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
      if (notifContainerRef.current && !notifContainerRef.current.contains(event.target as Node)) {
        setShowNotifDropdown(false);
      }
      if (uploadContainerRef.current && !uploadContainerRef.current.contains(event.target as Node)) {
        setShowUploadModal(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (location.pathname === '/search' || !searchVal.trim()) {
      setSearchResults({ tracks: [], playlists: [], artists: [] });
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      setIsSearching(true);
      
    Promise.all([
            mediaService.searchMedia(searchVal).catch(() => []),
            // Đổi từ getPlaylists() thành hàm search gọi đúng API Smart Search
            mediaService.searchPlaylists ? mediaService.searchPlaylists(searchVal).catch(() => []) : Promise.resolve([]),
            mediaService.getAllUsers().catch(() => [])
          ])
          .then(([tracksData, searchPlaylistsResult, allUsers]) => {
            // Không cần dùng .filter() ở đây nữa, vì Backend đã làm quá tốt việc tìm kiếm rồi!
            const filteredArtists = (allUsers || []).filter((u: any) => {
              const name = u.displayName || u.email || '';
              return name.toLowerCase().includes(searchVal.toLowerCase());
            });

            setSearchResults({
              tracks: tracksData || [],
              playlists: searchPlaylistsResult.slice(0, 5), // Lấy thẳng data xịn từ Backend
              artists: filteredArtists.slice(0, 5)
            });
          })
          .catch((error) => console.error("Lỗi tìm kiếm:", error))
          .finally(() => setIsSearching(false));
    }, 350);

    return () => clearTimeout(delayDebounceFn);
  }, [searchVal, location.pathname]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchVal(val);

    if (location.pathname === '/search') {
      if (val.trim()) {
        setSearchParams({ q: val }, { replace: true });
      } else {
        setSearchParams({}, { replace: true });
      }
    } else {
      setShowSearchDropdown(true);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchVal.trim())}`);
      setShowSearchDropdown(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    await mediaService.markNotificationAsRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const hasResults = searchResults.tracks.length > 0 || searchResults.playlists.length > 0 || searchResults.artists.length > 0;

  return (
    <header className="h-16 bg-[#09090b]/90 backdrop-blur-md px-6 flex items-center justify-between select-none relative z-50">
      
      <div className="flex items-center shrink-0">
        <Link to="/" className="text-emerald-500 font-black text-xl tracking-tight hover:opacity-80 transition flex items-center gap-2">
          <div className="w-8 h-8 bg-white text-black rounded-full flex items-center justify-center text-lg shadow-lg">V</div>
          <span className="hidden md:block">TuneVault</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="flex items-center gap-2 w-full max-w-xl">
          <Link 
            to="/" 
            className="w-10 h-10 flex items-center justify-center bg-[#1f1f1f] hover:bg-[#2a2a2a] rounded-full text-zinc-300 hover:text-white transition shrink-0"
            title="Trang chủ"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
              <path d="M12.5 3.247a1 1 0 0 0-1 0L4 7.577V20h4.5v-6a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v6H20V7.577l-7.5-4.33zm-2-1.732a3 3 0 0 1 3 0l7.5 4.33a2 2 0 0 1 1 1.732V21a1 1 0 0 1-1 1h-6.5a1 1 0 0 1-1-1v-6h-3v6a1 1 0 0 1-1-1H3a1 1 0 0 1-1-1V7.577a2 2 0 0 1 1-1.732l7.5-4.33z"></path>
            </svg>
          </Link>

          <form onSubmit={handleSearchSubmit} ref={searchContainerRef} className="relative w-full">
            <div className="relative flex items-center bg-[#1f1f1f] hover:bg-[#2a2a2a] focus-within:bg-[#2a2a2a] focus-within:ring-2 focus-within:ring-white rounded-full transition-all">
              <span className="absolute left-4 text-zinc-400 pointer-events-none">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </span>
              <input 
                type="text"
                value={searchVal}
                onChange={handleInputChange}
                onFocus={() => {
                  if (location.pathname !== '/search' && searchVal.trim()) {
                    setShowSearchDropdown(true);
                  }
                }}
                className="w-full bg-transparent text-white pl-11 pr-10 py-2.5 text-sm font-medium outline-none placeholder-zinc-400" 
                placeholder="Bạn muốn phát gì?" 
              />
              {searchVal && (
                <button 
                  type="button"
                  onClick={() => {
                    setSearchVal('');
                    if (location.pathname === '/search') setSearchParams({});
                    setShowSearchDropdown(false);
                  }}
                  className="absolute right-4 text-zinc-400 hover:text-white transition cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {showSearchDropdown && location.pathname !== '/search' && searchVal.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#282828] rounded-xl p-3 shadow-2xl z-50 text-white max-h-[420px] overflow-y-auto custom-scrollbar animate-fade-in space-y-4">
                {hasResults ? (
                  <>
                    {searchResults.tracks.length > 0 && (
                      <div>
                        <h4 className="text-[11px] font-bold text-zinc-400 mb-2 px-1">Bài hát & Video</h4>
                        <div className="space-y-1">
                          {searchResults.tracks.map((song) => (
                            <div
                              key={song.id}
                              onClick={() => {
                                if (handleSelectMedia) handleSelectMedia(song, null);
                                setShowSearchDropdown(false);
                              }}
                              className="w-full text-left p-2 hover:bg-white/10 rounded-lg transition flex items-center gap-3 cursor-pointer group"
                            >
                              {song.thumbnailPath ? (
                                <img src={getImgUrl(song.thumbnailPath)} alt="" className="w-10 h-10 rounded object-cover shrink-0" />
                              ) : (
                                <div className="w-10 h-10 rounded bg-[#333] flex items-center justify-center shrink-0">🎵</div>
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold text-white truncate">{song.title}</p>
                                <p className="text-xs text-zinc-400 truncate mt-0.5">{song.mediaType}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {searchResults.playlists.length > 0 && (
                      <div>
                        <h4 className="text-[11px] font-bold text-zinc-400 mb-2 px-1">Danh sách phát</h4>
                        <div className="space-y-1">
                          {searchResults.playlists.map((playlist) => (
                            <div
                              key={playlist.id}
                              onClick={() => {
                                if (setSelectedPlaylist) setSelectedPlaylist(playlist);
                                navigate('/playlist');
                                setShowSearchDropdown(false);
                              }}
                              className="w-full text-left p-2 hover:bg-white/10 rounded-lg transition flex items-center gap-3 cursor-pointer group"
                            >
                              <div className="w-10 h-10 rounded bg-[#333] flex items-center justify-center text-lg shrink-0">🎼</div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold text-white truncate">{playlist.name}</p>
                                <p className="text-xs text-zinc-400 truncate mt-0.5">Playlist</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {searchResults.artists.length > 0 && (
                      <div>
                        <h4 className="text-[11px] font-bold text-zinc-400 mb-2 px-1">Người dùng</h4>
                        <div className="space-y-1">
                          {searchResults.artists.map((artist) => {
                            const name = artist.displayName || artist.email;
                            return (
                              <div
                                key={artist.id}
                                onClick={() => {
                                  alert(`Xem hồ sơ: ${name}`);
                                  setShowSearchDropdown(false);
                                }}
                                className="w-full text-left p-2 hover:bg-white/10 rounded-lg transition flex items-center gap-3 cursor-pointer group"
                              >
                                <div className="w-10 h-10 rounded-full bg-[#333] flex items-center justify-center font-bold text-white shrink-0">
                                  {name.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-bold text-white truncate">{name}</p>
                                  <p className="text-xs text-zinc-400 truncate mt-0.5">Thành viên</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="pt-2 mt-2 border-t border-[#3f3f3f]">
                      <button
                        type="submit"
                        className="w-full text-center text-xs text-zinc-400 hover:text-white font-medium py-2 rounded-lg hover:bg-white/5 transition"
                      >
                        Xem tất cả kết quả cho "{searchVal}"
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-4 flex justify-center">
                    {isSearching ? (
                      <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <svg className="animate-spin h-5 w-5 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Đang quét nhanh hệ thống...
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-500 text-center">Không tìm thấy kết quả nào.</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </form>

          <div className="relative mt-1" ref={uploadContainerRef}>
            <button 
              onClick={() => setShowUploadModal(!showUploadModal)}
              className={`w-10 h-10 flex items-center justify-center rounded-full transition shrink-0 cursor-pointer ${showUploadModal ? 'bg-[#2a2a2a] text-emerald-400' : 'bg-[#1f1f1f] hover:bg-[#2a2a2a] text-zinc-300 hover:text-emerald-400'}`}
              title="Tải lên Video/Audio"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            </button>
            {showUploadModal && (
              <UploadModal onClose={() => setShowUploadModal(false)} onUploaded={() => {
                window.location.reload();
              }} />
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <div className="w-10 h-10 flex items-center justify-center">
          <Link to="/share-inbox" className="text-zinc-400 hover:text-white transition" title="Hộp thư chia sẻ">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
              <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0 -1.79 1.11z"></path>
            </svg>
          </Link>
        </div>

        <div ref={notifContainerRef} className="relative w-10 h-10 flex items-center justify-center">
          <button 
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className={`text-zinc-400 hover:text-white transition relative cursor-pointer ${showNotifDropdown ? 'text-white' : ''}`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-emerald-500 text-black font-black text-[9px] h-4 w-4 rounded-full flex items-center justify-center border-2 border-[#09090b]">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifDropdown && (
            <div className="absolute right-0 mt-4 w-80 bg-[#282828] rounded-xl shadow-2xl z-50 text-white animate-fade-in overflow-hidden flex flex-col top-full">
              <div className="text-xs font-bold p-4 pb-2 border-b border-zinc-700">Thông báo</div>
              <div className="max-h-72 overflow-y-auto custom-scrollbar px-2 pb-2 mt-2">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      onClick={() => !n.isRead && handleMarkAsRead(n.id)}
                      className={`p-3 transition rounded-lg cursor-pointer hover:bg-white/10 ${n.isRead ? 'opacity-50' : 'bg-white/5'}`}
                    >
                      <div className="flex gap-3 items-start">
                        <div className="shrink-0 mt-0.5">
                          {n.notificationType === 'SHARE_MEDIA' ? (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-emerald-400"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                          ) : (
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-zinc-300"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-bold truncate ${n.isRead ? 'text-zinc-300' : 'text-white'}`}>{n.title}</p>
                          <p className="text-xs text-zinc-400 line-clamp-2 mt-1">{n.message}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-sm text-zinc-500 py-8">Không có thông báo mới.</p>
                )}
              </div>
              
              <div className="p-2 border-t border-zinc-700 bg-zinc-800/50">
                <Link 
                  to="/notifications" 
                  onClick={() => setShowNotifDropdown(false)}
                  className="block w-full text-center text-xs font-bold text-zinc-400 hover:text-emerald-400 py-2 hover:bg-white/10 rounded-lg transition"
                >
                  Xem toàn bộ thông báo
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="w-10 h-10 flex items-center justify-center">
          <Link 
            to="/profile" 
            className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center text-sm font-bold hover:scale-105 transition shadow-md"
            title="Hồ sơ cá nhân"
          >
            👤
          </Link>
        </div>
      </div>
    </header>
  );
}