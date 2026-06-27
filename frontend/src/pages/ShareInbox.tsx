import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr';
import { mediaService } from '../services/api';
import { type MediaShareModel } from '../types/media';
import { PlayerContext } from '../App';

// Hàm hỗ trợ format thời gian thân thiện (Vừa xong, x phút trước...)
const formatRelativeTime = (dateString?: string) => {
  if (!dateString) return '';
  try {
    // FIX MÚI GIỜ: Kiểm tra nếu chuỗi thiếu 'Z' (UTC) hoặc offset múi giờ thì tự động thêm 'Z'
    // Để ép trình duyệt hiểu đây là giờ chuẩn quốc tế, sau đó tự quy đổi ra giờ Local của người dùng (VD: Việt Nam +7)
    let safeDateString = dateString;
    if (!safeDateString.endsWith('Z') && !safeDateString.match(/[+-]\d{2}:?\d{2}$/)) {
      safeDateString += 'Z';
    }

    const date = new Date(safeDateString);
    if (isNaN(date.getTime())) return '';
    
    const diffInSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
    
    // Đảm bảo không bị số âm nếu thời gian client chạy nhanh hơn server vài mili-giây
    const safeDiff = diffInSeconds < 0 ? 0 : diffInSeconds;
    
    if (safeDiff < 60) return 'Vừa xong';
    if (safeDiff < 3600) return `${Math.floor(safeDiff / 60)} phút trước`;
    if (safeDiff < 86400) return `${Math.floor(safeDiff / 3600)} giờ trước`;
    if (safeDiff < 2592000) return `${Math.floor(safeDiff / 86400)} ngày trước`;
    
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return '';
  }
};

export default function ShareInbox() {
  const [sharedMedia, setSharedMedia] = useState<MediaShareModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tick, setTick] = useState(0); // Dùng để ép re-render cập nhật thời gian "phút trước"
  
  // Lưu trữ tên và loại (Audio/Video/Playlist) của các Media/Playlist 
  const [titles, setTitles] = useState<Record<number, { text: string, type: string }>>({});

  const { handleSelectMedia, setSelectedPlaylist } = useContext(PlayerContext) || {};
  const navigate = useNavigate();

  // Hàm tải dữ liệu riêng biệt để tái sử dụng
  const fetchSharedData = async () => {
    try {
      const data = await mediaService.getSharedMedia();
      const shares = Array.isArray(data) ? data : [];
      setSharedMedia(shares);
      
      const newTitles: Record<number, { text: string, type: string }> = {};
      
      await Promise.all(shares.map(async (share) => {
        if (share.mediaId > 0 && !newTitles[share.shareId]) {
          try {
            const media = await mediaService.getMediaById(share.mediaId);
            if (media && media.title) {
              newTitles[share.shareId] = { 
                text: media.title, 
                type: media.mediaType === 'Video' ? 'Video' : 'Audio' 
              };
            }
          } catch (error) {
            console.error("Lỗi tải tên media", error);
          }
        } else if (share.playlistId > 0 && !newTitles[share.shareId]) {
          try {
            const resp = await (await window.fetch(`/api/playlists/${share.playlistId}`)).json();
            if (resp && resp.name) {
              newTitles[share.shareId] = { text: resp.name, type: 'Danh sách phát' };
            }
          } catch (error) {
            console.error("Lỗi tải tên playlist", error);
          }
        }
      }));
      
      setTitles(prev => ({ ...prev, ...newTitles }));
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu được chia sẻ", err);
      setSharedMedia([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // 1. Tải dữ liệu ban đầu
    fetchSharedData();

    // 2. Thiết lập interval để tự động ép re-render component, giúp cập nhật "14 phút trước"
    const timer = setInterval(() => {
      setTick(t => t + 1);
    }, 10000); // Tự cập nhật thời gian mỗi 10 giây

    // 3. Kết nối SignalR để lắng nghe chia sẻ mới Real-time
    let connection: HubConnection | null = null;
    const token = localStorage.getItem('tune_vault_token');
    
    if (token) {
      try {
        connection = new HubConnectionBuilder()
          .withUrl("/hubs/notifications", {
            accessTokenFactory: () => token
          })
          .withAutomaticReconnect()
          .build();

        connection.start()
          .then(() => {
            connection?.on("ReceiveNotification", (notif: any) => {
              // Nếu thông báo là chia sẻ nhạc thì load lại danh sách ngay!
              if (notif.notificationType === 'SHARE_MEDIA') {
                fetchSharedData(); 
              }
            });
          })
          .catch(err => console.error("SignalR Connection Error in ShareInbox:", err));
      } catch (err) {
        console.error("SignalR Init Error:", err);
      }
    }

    // Cleanup khi component bị hủy
    return () => {
      clearInterval(timer);
      if (connection) {
        connection.off("ReceiveNotification");
        connection.stop();
      }
    };
  }, []);

  const handlePlayShare = async (share: MediaShareModel) => {
    try {
      if (share.mediaId && share.mediaId > 0) {
        const media = await mediaService.getMediaById(share.mediaId);
        if (media && handleSelectMedia) {
          handleSelectMedia(media);
        }
      } else if (share.playlistId && share.playlistId > 0) {
        if (setSelectedPlaylist) {
          const resp = await (await (window.fetch(`/api/playlists/${share.playlistId}`))).json();
          const pl = resp || null;
          if (pl) setSelectedPlaylist(pl);
          navigate('/playlist');
        }
      }
    } catch (err) {
      console.error('Play shared media failed', err);
      alert('Không thể phát nội dung được chia sẻ ngay bây giờ.');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div>
        <h2 className="text-2xl font-black text-white">Hộp thư được chia sẻ</h2>
        <p className="text-zinc-400 text-xs mt-1">
          Danh sách các tệp âm thanh được gửi riêng cho bạn từ bạn bè trong hệ thống.
        </p>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-8 min-h-[300px] flex flex-col items-center justify-center transition-all">
        {isLoading ? (
          <p className="text-sm text-zinc-500 animate-pulse">Đang kiểm tra hộp thư...</p>
        ) : sharedMedia.length > 0 ? (
          <div className="w-full space-y-3">
             {sharedMedia.map((share) => (
               <div key={share.shareId} className="bg-zinc-800/40 border border-zinc-700/50 p-4 rounded-xl flex items-start gap-4 hover:bg-zinc-800/80 transition group shadow-md">
                 <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl shrink-0 border border-emerald-500/30">
                   💌
                 </div>
                 <div className="flex-1 min-w-0">
                   <p className="text-sm text-white font-bold mb-1">
                     <span className="text-emerald-400">{share.senderName || `Thành viên #${share.senderId}`}</span> đã gửi cho bạn một nội dung.
                   </p>
                   {share.message && (
                     <p className="text-xs text-zinc-300 italic mb-2 bg-zinc-900/80 p-2.5 rounded-lg border border-zinc-700/50">
                       "{share.message}"
                     </p>
                   )}
                   <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-medium">
                     {/* Sử dụng formatRelativeTime, nó sẽ tự update nhờ setTick */}
                     <span>{formatRelativeTime(share.sharedAt)}</span>
                     <span>•</span>
                     <span className="text-emerald-300 font-bold truncate pr-4">
                        {titles[share.shareId] ? `${titles[share.shareId].type}: ${titles[share.shareId].text}` : 'Đang tải tên...'}
                     </span>
                   </div>
                 </div>
                 <button 
                   onClick={() => handlePlayShare(share)}
                   className="bg-white text-black hover:bg-emerald-500 hover:text-black px-5 py-2.5 rounded-full text-xs font-bold hover:scale-105 active:scale-95 transition shadow-lg shrink-0 cursor-pointer"
                 >
                   Phát ngay
                 </button>
               </div>
             ))}
          </div>
        ) : (
          <p className="text-sm text-zinc-400 text-center">
            Hộp thư trống. Hiện tại bạn chưa nhận được tệp âm thanh nào được chia sẻ.
          </p>
        )}
      </div>
    </div>
  );
}