import { useEffect, useContext, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PlayerContext } from '../App';
import { mediaService } from '../services/api';
import { type Song } from '../types/media';

export default function VideoPlayer() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [video, setVideo] = useState<Song | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);

  const {
    setIsPlaying, setPipVideo, isPlaying,
    volume, isLooping, seekTime, setSeekTime,
    setCurrentTime, currentTime, setDuration,
    handleSelectMedia, currentSong 
  } = useContext(PlayerContext) || {};

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      mediaService.getSongs()
        .then(songs => {
          const found = songs.find((s: Song) => s.id === Number(id) && s.mediaType === 'Video');
          setVideo(found || null);

          // ĐỒNG BỘ: Nếu load thẳng URL, update luôn context để khung phải có dữ liệu
          if (found && handleSelectMedia && currentSong?.id !== found.id) {
             handleSelectMedia(found, null);
          }
        })
        .catch(() => setVideo(null))
        .finally(() => setIsLoading(false));
    }
  }, [id]);

  const handleExit = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
    if (setIsPlaying) setIsPlaying(false);
    navigate(-1);
  };

  const handleTriggerPiP = () => {
    if (setPipVideo && video) {
      setPipVideo(video); // Đưa video vào Context để App.tsx mount thẻ PiP
      navigate(-1);       // Trở về trang trước đó
    }
  };

  // Đồng bộ thời gian: Khi VideoPlayer load (ví dụ từ PiP bung to ra), lấy currentTime từ PlayerContext truyền vào
  useEffect(() => {
    if (videoRef.current && video) {
      videoRef.current.currentTime = currentTime || 0;
    }
  }, [video]); // Chỉ set 1 lần khi video load xong

  useEffect(() => {
    if (videoRef.current && video) {
      if (isPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
      videoRef.current.volume = volume ?? 1;
      videoRef.current.loop = isLooping ?? false;
    }
  }, [isPlaying, volume, isLooping, video]);

  useEffect(() => {
    if (videoRef.current && seekTime !== null && seekTime !== undefined) {
      videoRef.current.currentTime = seekTime;
      if (setSeekTime) setSeekTime(null);
    }
  }, [seekTime, setSeekTime]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <svg className="animate-spin h-10 w-10 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-zinc-400 text-sm animate-pulse">Đang nạp luồng video...</p>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="p-6 text-center space-y-4">
        <p className="text-zinc-400">Không tìm thấy video yêu cầu hoặc dữ liệu tệp bị lỗi.</p>
        <button onClick={() => navigate('/')} className="text-emerald-500 hover:underline text-xs font-bold cursor-pointer">
          ← Quay lại trang chủ
        </button>
      </div>
    );
  }

  const fullVideoUrl = video ? `/api/Media/${video.id}/stream` : '';

  return (
    <div className="p-4 md:p-6 space-y-4 animate-fade-in max-w-5xl mx-auto flex flex-col h-full">

      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900 border border-zinc-800 p-4 rounded-2xl shadow-lg shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={handleTriggerPiP}
            className="bg-zinc-800 hover:bg-emerald-600 text-white hover:text-black px-4 py-2 rounded-full text-xs font-bold flex items-center gap-1.5 transition shadow-md active:scale-95 cursor-pointer"
            title="Thu nhỏ video xuống góc màn hình để lướt tìm nhạc khác"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
              <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
              <rect x="13" y="13" width="7" height="7"></rect>
            </svg>
            Thu nhỏ (PiP)
          </button>

          <button
            onClick={handleExit}
            className="bg-zinc-800/80 hover:bg-red-500/20 text-zinc-300 hover:text-red-400 border border-zinc-700 hover:border-red-500/50 px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition cursor-pointer shadow-md"
          >
            <span className="text-sm font-black">✕</span> Đóng Video & Thoát
          </button>
        </div>

        <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded text-[10px] font-extrabold uppercase tracking-widest shadow-sm">
          TuneVault Video Player
        </span>
      </div>

      <div className="w-full bg-black rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 flex-1 relative min-h-[45vh] lg:min-h-[55vh]">
        <video
          ref={videoRef}
          src={fullVideoUrl}
          controls
          autoPlay
          className="w-full h-full object-contain absolute inset-0 outline-none"
          onTimeUpdate={(e) => setCurrentTime && setCurrentTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration && setDuration(e.currentTarget.duration)}
          onEnded={() => { if (!isLooping && setIsPlaying) setIsPlaying(false); }}
          onPlay={() => setIsPlaying && setIsPlaying(true)}
          onPause={() => setIsPlaying && setIsPlaying(false)}
        />
      </div>

      <div className="bg-zinc-900/60 p-5 rounded-2xl border border-zinc-800/50 space-y-2 shrink-0">
        <h2 className="text-xl font-black text-white">{video.title}</h2>
        <p className="text-zinc-400 text-xs leading-relaxed">
          {video.description || "Nội dung đa phương tiện trực tuyến này thuộc bản quyền hệ thống lưu trữ TuneVault Cloud."}
        </p>
      </div>

    </div>
  );
}