import { useEffect, useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { mediaService } from '../services/api';
import { type Song, type PlaylistModel } from '../types/media';
import { PlayerContext } from '../App';

export default function Home() {
  const [playlists, setPlaylists] = useState<PlaylistModel[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  
  // State cho AI Recommendations
  const [aiRecommendations, setAiRecommendations] = useState<Song[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  const [activeFilter, setActiveFilter] = useState<'All' | 'Audio' | 'Video'>('All');
  
  // FIX: Sửa lại state để nhận cả string (để tách biệt ID của khung AI và khung Thể loại)
  const [activeShareId, setActiveShareId] = useState<number | string | null>(null);
  const shareMenuRef = useRef<HTMLDivElement | null>(null);

  const { 
    handleSelectMedia, setSelectedPlaylist, followFilterUserId
  } = useContext(PlayerContext) || {};
  
  const navigate = useNavigate();

  // Tách hàm gọi AI ra riêng để tái sử dụng cho Real-time
  const fetchAiRecommendations = () => {
    const token = localStorage.getItem('tune_vault_token');
    if (!token) return;

    setIsAiLoading(true);
    fetch('/api/Ai/recommendations', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => {
        if (!res.ok) throw new Error("Lỗi API AI");
        return res.json();
    })
    .then(data => {
      if (data && data.recommendations) {
        setAiRecommendations(data.recommendations);
      }
    })
    .catch(err => console.error("Không thể lấy gợi ý AI:", err))
    .finally(() => setIsAiLoading(false));
  };

  useEffect(() => {
    // 1. LẤY PLAYLIST TỪ BACKEND (Xử lý đồng thời cả Public và Private để đảm bảo có dữ liệu hiển thị)
    Promise.all([
      mediaService.getPublicPlaylists().catch(() => []),
      mediaService.getPlaylists ? mediaService.getPlaylists().catch(() => []) : Promise.resolve([])
    ]).then(([publicRes, privateRes]) => {
      // Hàm bóc tách array an toàn cho backend .NET / SSMS
      const extractArray = (res: any) => {
        if (Array.isArray(res)) return res;
        if (res?.data && Array.isArray(res.data)) return res.data;
        if (res?.Data && Array.isArray(res.Data)) return res.Data;
        if (res?.items && Array.isArray(res.items)) return res.items;
        if (res?.Items && Array.isArray(res.Items)) return res.Items;
        return [];
      };

      const pubList = extractArray(publicRes);
      const privList = extractArray(privateRes);
      
      // Gộp lại và loại bỏ trùng lặp theo ID
      const combined = [...pubList, ...privList];
      const uniquePlaylists = Array.from(new Map(combined.map(p => [p.id || p.Id, p])).values());

      // Chuẩn hóa Mapping đảm bảo khớp 100% với PlaylistModel (xử lý case PascalCase của C#)
      const mappedPlaylists = uniquePlaylists.map((item: any) => ({
        ...item,
        id: item.id ?? item.Id ?? item.PlaylistId,
        userId: item.userId ?? item.UserId,
        name: item.name ?? item.Name ?? "Playlist Không Tên",
        description: item.description ?? item.Description ?? "Danh sách chọn lọc.",
        isPublic: item.isPublic ?? item.IsPublic ?? true,
        createdAt: item.createdAt ?? item.CreatedAt ?? new Date().toISOString(),
        tracksCount: item.tracksCount ?? item.TracksCount ?? 0
      }));

      setPlaylists(mappedPlaylists);
    }).catch(e => console.error("Lỗi đồng bộ Playlist Nổi Bật:", e));

    // 2. LẤY DANH SÁCH BÀI HÁT / VIDEO
    mediaService.getSongs().then((res: any) => {
      let sList = [];
      if (Array.isArray(res)) sList = res;
      else if (res?.data && Array.isArray(res.data)) sList = res.data;
      else if (res?.Data && Array.isArray(res.Data)) sList = res.Data;
      else if (res?.items && Array.isArray(res.items)) sList = res.items;
      
      const mappedSongs = sList.map((item: any) => ({
        ...item,
        id: item.id ?? item.Id ?? item.MediaId,
        title: item.title ?? item.Title ?? "Unknown Title",
        mediaType: item.mediaType ?? item.MediaType ?? 'Audio',
        thumbnailPath: item.thumbnailPath ?? item.ThumbnailPath,
        ownerUserId: item.ownerUserId ?? item.OwnerUserId,
        genre: item.genre ?? item.Genre,
        description: item.description ?? item.Description,
        artist: item.artist ?? item.Artist
      }));
      setSongs(mappedSongs || []);
    }).catch(e => console.error("Lỗi lấy danh sách bài hát:", e));
    
    // Gọi AI lần đầu khi vào trang
    fetchAiRecommendations();

    // Lắng nghe sự kiện để cập nhật AI Real-time khi tương tác (nghe nhạc, thả tim)
    const handleInteractionsUpdate = () => {
      fetchAiRecommendations();
    };
    window.addEventListener('tune_vault_interactions_updated', handleInteractionsUpdate);
    window.addEventListener('tune_vault_history_updated', handleInteractionsUpdate);

    const token = localStorage.getItem('tune_vault_token');
    let currentUserId = "-1";
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        currentUserId = String(payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] || payload['nameid'] || payload['sub'] || payload['id'] || "-1");
      } catch (e) {
        console.error("Lỗi giải mã token:", e);
      }
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
      } else if (response && Array.isArray(response.Data)) {
        userList = response.Data;
      }

      const filteredUsers = userList.filter((u: any) => {
        const uid = u.id || u.userId || u.Id;
        return uid && String(uid) !== currentUserId;
      });
      setUsers(filteredUsers);
    }).catch(e => console.error("Lỗi lấy danh sách user:", e));

    return () => {
      window.removeEventListener('tune_vault_interactions_updated', handleInteractionsUpdate);
      window.removeEventListener('tune_vault_history_updated', handleInteractionsUpdate);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setActiveShareId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpenPlaylist = (pl: PlaylistModel) => {
    if (setSelectedPlaylist) {
      setSelectedPlaylist(pl);
      navigate('/playlist');
    }
  };

  const filteredSongs = songs.filter(s => {
    if (activeFilter !== 'All' && s.mediaType !== activeFilter) return false;
    if (followFilterUserId) return Number(s.ownerUserId) === Number(followFilterUserId);
    return true;
  });

  const groupedSongs = filteredSongs.reduce((acc, song) => {
    const genre = song.genre || 'Chưa phân loại';
    if (!acc[genre]) {
      acc[genre] = [];
    }
    acc[genre].push(song);
    return acc;
  }, {} as Record<string, Song[]>);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight mb-4">Chào mừng bạn quay lại</h1>
        <div className="flex flex-col gap-3 border-b border-zinc-800/50 pb-3">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setActiveFilter('All')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${activeFilter === 'All' ? 'bg-white text-black scale-105 shadow-md' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}
            >
              Tất cả
            </button>
            <button 
              onClick={() => setActiveFilter('Audio')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${activeFilter === 'Audio' ? 'bg-white text-black scale-105 shadow-md' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}
            >
              Nhạc
            </button>
            <button 
              onClick={() => setActiveFilter('Video')}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${activeFilter === 'Video' ? 'bg-white text-black scale-105 shadow-md' : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}
            >
              Podcast / Video
            </button>
          </div>
        </div>
      </div>

      {/* KHUNG AI RECOMMENDATIONS */}
      {activeFilter === 'All' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 flex items-center gap-2 cursor-pointer">
              🎧 Giai điệu dành cho bạn
            </h2>
          </div>
          
          {isAiLoading ? (
             <div className="p-8 text-center bg-zinc-900/40 rounded-xl border border-zinc-800 text-zinc-500 text-xs">
               <span className="animate-pulse inline-block">Hệ thống đang chuẩn bị danh sách gợi ý mới nhất...</span>
             </div>
          ) : aiRecommendations.length > 0 ? (
            <div className="flex gap-4 sm:gap-6 overflow-x-auto custom-scrollbar pb-4 snap-x">
              {aiRecommendations.map(song => {
                const aiShareId = `ai-${song.id}`; // FIX: Tạo ID duy nhất cho khung AI
                return (
                <div 
                  key={`ai-${song.id}`}
                  className="bg-[#181818] p-3 rounded-xl hover:bg-[#282828] transition-all duration-300 group cursor-pointer border border-emerald-900/30 shadow-[0_0_15px_rgba(16,185,129,0.05)] hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] flex flex-col relative shrink-0 w-32 sm:w-36 md:w-40 snap-start"
                >
                  <div onClick={() => handleSelectMedia && handleSelectMedia(song)} className="relative w-full aspect-square bg-zinc-800 rounded-lg mb-3 overflow-hidden shadow-inner">
                    {song.thumbnailPath ? (
                      <img 
                        src={song.thumbnailPath.startsWith('http') ? song.thumbnailPath : `/api/media/thumbnail/${song.id}`} 
                        alt={song.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1614680376593-902f74fa0d41?w=400'; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl bg-zinc-800">🎵</div>
                    )}
                    <span className={`absolute top-2 left-2 text-[9px] font-black px-2 py-0.5 rounded border shadow-md uppercase tracking-wider ${song.mediaType === 'Video' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}`}>
                      {song.mediaType || 'Audio'}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 mb-2" onClick={() => handleSelectMedia && handleSelectMedia(song)}>
                    <h3 className="font-bold text-[13px] text-emerald-400 truncate mb-1">{song.title}</h3>
                    <p className="text-zinc-400 text-[11px] truncate">{song.artist || "Được đề xuất"}</p>
                  </div>
                  
                  {/* Share button cho AI Card */}
                  <div className="relative w-full mt-auto" ref={activeShareId === aiShareId ? shareMenuRef : null}>
                    <button 
                      onClick={(e) => { 
                        e.preventDefault();
                        e.stopPropagation(); 
                        setActiveShareId(activeShareId === aiShareId ? null : aiShareId); 
                      }}
                      className="w-full py-1.5 bg-zinc-800/70 hover:bg-emerald-500 text-zinc-300 hover:text-black font-bold text-[11px] rounded-lg border border-zinc-700/50 hover:border-emerald-500 transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                      Chia sẻ
                    </button>

                    {activeShareId === aiShareId && (
                      <div 
                        className="absolute bottom-full left-0 mb-2 w-56 bg-[#282828] border border-zinc-700 rounded-xl p-3 shadow-2xl z-50 animate-fade-in text-white cursor-default"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      >
                        <div className="text-[10px] font-bold text-zinc-400 mb-1.5 px-1 uppercase tracking-wider">Gửi trực tiếp cho:</div>
                        
                        <div className="max-h-36 overflow-y-auto space-y-1 custom-scrollbar">
                          {users.map((u) => {
                            const uid = u.id || u.userId || u.Id;
                            const uName = u.fullName || u.FullName || u.displayName || u.DisplayName || u.username || u.UserName || u.email || u.Email || `User #${uid}`;
                            
                            return (
                              <button
                                key={uid}
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  try {
                                    // Chỗ này API truyền vẫn dùng ID thật của bài hát
                                    await mediaService.shareMedia(song.id, uid);
                                    alert(`Đã gửi "${song.title}" cho ${uName}!`);
                                  } catch (error: any) {
                                    alert(`Lỗi khi chia sẻ: ${error.message || 'Xin vui lòng thử lại sau.'}`);
                                  } finally {
                                    setActiveShareId(null);
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
                            <p className="text-[10px] text-zinc-500 italic px-1 text-center py-2">Hệ thống chưa có người dùng khác.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )})}
            </div>
          ) : (
            <div className="p-4 text-center bg-zinc-900/40 rounded-xl border border-zinc-800 text-zinc-500 text-xs italic">
               Chưa có đủ dữ liệu để hệ thống gợi ý. Hãy nghe thêm vài bài nhạc nhé!
            </div>
          )}
        </div>
      )}

      {/* KHUNG PLAYLIST NỔI BẬT (Đã kết nối Backend và Data Mapping chuẩn) */}
      {activeFilter === 'All' && (
        <div className="space-y-3 mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-white hover:underline cursor-pointer">Playlist Nổi Bật</h2>
          </div>
          
          {playlists.length > 0 ? (
            <div className="flex gap-4 sm:gap-6 overflow-x-auto custom-scrollbar pb-4 snap-x">
              {playlists.map(pl => {
                const plId = pl.id;
                const plName = pl.name;
                const plDesc = pl.description;
                return (
                  <div 
                    key={plId} 
                    onClick={() => handleOpenPlaylist(pl)}
                    className="bg-[#181818] p-3 rounded-xl hover:bg-[#282828] transition-all duration-300 group cursor-pointer border border-zinc-900 shadow-lg hover:shadow-2xl flex flex-col shrink-0 w-32 sm:w-36 md:w-40 snap-start"
                  >
                    <div className="w-full aspect-square bg-gradient-to-br from-zinc-700 to-zinc-900 rounded-lg mb-3 shadow-md flex items-center justify-center relative overflow-hidden">
                      <span className="text-3xl group-hover:scale-110 transition-transform duration-300">🎶</span>
                      <span className="absolute top-2 left-2 text-[10px] bg-black/60 text-emerald-400 px-2 py-0.5 rounded-full font-extrabold border border-emerald-500/20">PLAYLIST</span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <h3 className="font-bold text-[13px] text-white truncate">{plName}</h3>
                      </div>
                      <p className="text-zinc-400 text-[11px] truncate leading-relaxed">{plDesc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 text-center bg-zinc-900/40 rounded-xl border border-zinc-800 text-zinc-500 text-xs italic">
               Hiện tại hệ thống chưa có Playlist Nổi Bật nào được khởi tạo.
            </div>
          )}
        </div>
      )}

      {/* DANH SÁCH BÀI HÁT THEO THỂ LOẠI */}
      {Object.keys(groupedSongs).length > 0 ? (
        Object.entries(groupedSongs).map(([genre, genreSongs]) => (
          <div key={genre} className="space-y-3 mt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-white hover:underline cursor-pointer border-l-4 border-emerald-500 pl-3">
                Thể loại: {genre}
              </h2>
            </div>

            <div className="flex gap-4 sm:gap-6 overflow-x-auto custom-scrollbar pb-4 snap-x">
              {genreSongs.map(song => (
                <div 
                  key={song.id}
                  className="bg-[#181818] p-3 rounded-xl hover:bg-[#282828] transition-all duration-300 group cursor-pointer border border-zinc-900 shadow-lg flex flex-col relative shrink-0 w-32 sm:w-36 md:w-40 snap-start"
                >
                  <div onClick={() => handleSelectMedia && handleSelectMedia(song)} className="relative w-full aspect-square bg-zinc-800 rounded-lg mb-3 overflow-hidden shadow-inner">
                    {song.thumbnailPath ? (
                      <img 
                        src={song.thumbnailPath.startsWith('http') ? song.thumbnailPath : `/api/media/thumbnail/${song.id}`} 
                        alt={song.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1614680376593-902f74fa0d41?w=400'; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl bg-zinc-800">🎵</div>
                    )}
                    <span className={`absolute top-2 left-2 text-[9px] font-black px-2 py-0.5 rounded border shadow-md uppercase tracking-wider ${song.mediaType === 'Video' ? 'bg-red-500/20 text-red-400 border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'}`}>
                      {song.mediaType}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 mb-2" onClick={() => handleSelectMedia && handleSelectMedia(song)}>
                    <h3 className="font-bold text-[13px] text-white truncate mb-1">{song.title}</h3>
                    <p className="text-zinc-400 text-[11px] truncate">{song.description || "Không có mô tả bài viết."}</p>
                  </div>

                  <div className="relative w-full mt-auto" ref={activeShareId === song.id ? shareMenuRef : null}>
                    <button 
                      onClick={(e) => { 
                        e.preventDefault();
                        e.stopPropagation(); 
                        setActiveShareId(activeShareId === song.id ? null : song.id); 
                      }}
                      className="w-full py-1.5 bg-zinc-800/70 hover:bg-emerald-500 text-zinc-300 hover:text-black font-bold text-[11px] rounded-lg border border-zinc-700/50 hover:border-emerald-500 transition-all active:scale-95 flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                      Chia sẻ
                    </button>

                    {activeShareId === song.id && (
                      <div 
                        className="absolute bottom-full left-0 mb-2 w-56 bg-[#282828] border border-zinc-700 rounded-xl p-3 shadow-2xl z-50 animate-fade-in text-white cursor-default"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                      >
                        <div className="text-[10px] font-bold text-zinc-400 mb-1.5 px-1 uppercase tracking-wider">Gửi trực tiếp cho:</div>
                        
                        <div className="max-h-36 overflow-y-auto space-y-1 custom-scrollbar">
                          {users.map((u) => {
                            const uid = u.id || u.userId || u.Id;
                            const uName = u.fullName || u.FullName || u.displayName || u.DisplayName || u.username || u.UserName || u.email || u.Email || `User #${uid}`;
                            
                            return (
                              <button
                                key={uid}
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  try {
                                    await mediaService.shareMedia(song.id, uid);
                                    alert(`Đã gửi "${song.title}" cho ${uName}!`);
                                  } catch (error: any) {
                                    alert(`Lỗi khi chia sẻ: ${error.message || 'Xin vui lòng thử lại sau.'}`);
                                  } finally {
                                    setActiveShareId(null);
                                  }
                                }}
                                className="w-full text-left p-2 hover:bg-zinc-700 rounded-lg text-[11px] font-medium transition flex items-center gap-2 group text-zinc-300 hover:text-white cursor-pointer"
                              >
                                <div className="w-6 h-6 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center text-[10px] font-black group-hover:bg-emerald-500 group-hover:text-black shrink-0">
                                  {uName.charAt(0).toUpperCase()}
                                </div>
                                <span className="truncate flex-1">{uName}</span>
                              </button>
                            );
                          })}
                          {users.length === 0 && (
                            <p className="text-[10px] text-zinc-500 italic px-1 text-center py-2">Hệ thống chưa có người dùng khác.</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                </div>
              ))}
            </div>
          </div>
        ))
      ) : (
        <div className="p-8 text-center bg-zinc-900/40 rounded-xl border border-zinc-800 text-zinc-500 text-xs italic">
          Không có dữ liệu thuộc định dạng này được tìm thấy.
        </div>
      )}
    </div>
  );
}