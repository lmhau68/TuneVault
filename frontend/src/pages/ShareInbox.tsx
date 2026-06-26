import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { mediaService } from '../services/api';
import { type MediaShareModel } from '../types/media';
import { PlayerContext } from '../App';

export default function ShareInbox() {
  const [sharedMedia, setSharedMedia] = useState<MediaShareModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    mediaService.getSharedMedia()
      .then(data => {
        setSharedMedia(Array.isArray(data) ? data : []);
      })
      .catch(err => {
        console.error("Lỗi khi tải dữ liệu được chia sẻ", err);
        setSharedMedia([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const { handleSelectMedia, setSelectedPlaylist } = useContext(PlayerContext) || {};
  const navigate = useNavigate();

  const handlePlayShare = async (share: MediaShareModel) => {
    try {
      if (share.mediaId && share.mediaId > 0) {
        const media = await mediaService.getMediaById(share.mediaId);
        if (media && handleSelectMedia) {
          handleSelectMedia(media);
        }
      } else if (share.playlistId && share.playlistId > 0) {
        // open playlist view
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
                     <span>{new Date(share.sharedAt).toLocaleString('vi-VN')}</span>
                     <span>•</span>
                     <span>Mã tệp: #{share.mediaId > 0 ? share.mediaId : share.playlistId}</span>
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