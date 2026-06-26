import React, { useState, useRef, useEffect } from 'react';
import { mediaService } from '../services/api';

export default function UploadModal({ onClose, onUploaded }: any) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [genre, setGenre] = useState('');
  const [description, setDescription] = useState('');
  
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setFile(null); setTitle(''); setArtist(''); setAlbum(''); setGenre(''); setDescription('');
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (f) setFile(f);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!file) return alert('Vui lòng chọn hoặc kéo thả file Audio/Video để upload.');
    
    if (!title || !title.trim()) {
        return alert('Vui lòng nhập tiêu đề (Title) bắt buộc!');
    }

    setIsUploading(true);
    
    try {
      const fd = new FormData();
      fd.append('Title', title.trim());
      if (artist) fd.append('Artist', artist);
      if (album) fd.append('Album', album);
      if (genre) fd.append('Genre', genre);
      if (description) fd.append('Description', description);
      fd.append('File', file);

      const res = await mediaService.uploadMedia(fd);
      alert('Tải lên nội dung thành công!');
      if (onUploaded) onUploaded(res);
      onClose && onClose();
    } catch (err: any) {
      console.error('Upload failed', err);
      alert('Upload thất bại: ' + (err?.message || 'Lỗi hệ thống'));
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div 
      className="absolute top-full right-0 mt-3 w-[90vw] sm:w-[450px] md:w-[500px] bg-[#282828] border border-zinc-700 rounded-2xl shadow-2xl z-[100] flex flex-col max-h-[80vh] overflow-hidden cursor-default animate-fade-in origin-top-right text-left" 
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between p-4 border-b border-zinc-700/60 shrink-0 bg-zinc-800/50">
        <h3 className="text-sm font-black text-white uppercase tracking-wider">Tải lên tệp Media</h3>
        <button onClick={() => onClose && onClose()} className="text-zinc-400 hover:text-white hover:bg-zinc-700 w-7 h-7 rounded-full flex items-center justify-center transition cursor-pointer">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <div className="p-4 overflow-y-auto custom-scrollbar">
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-zinc-400 block mb-1 uppercase tracking-wide">Tiêu đề <span className="text-red-500">*</span></label>
              <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="Tên bài hát / video..." className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500 transition placeholder:text-zinc-600" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-400 block mb-1 uppercase tracking-wide">Nghệ sĩ thể hiện</label>
              <input value={artist} onChange={e => setArtist(e.target.value)} placeholder="Tên nghệ sĩ..." className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500 transition placeholder:text-zinc-600" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-400 block mb-1 uppercase tracking-wide">Thuộc Album</label>
              <input value={album} onChange={e => setAlbum(e.target.value)} placeholder="Tên Album..." className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500 transition placeholder:text-zinc-600" />
            </div>
            <div>
              <label className="text-[10px] font-bold text-zinc-400 block mb-1 uppercase tracking-wide">Thể loại</label>
              <select 
                value={genre} 
                onChange={e => setGenre(e.target.value)} 
                className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500 transition appearance-none cursor-pointer"
              >
                <option value="" disabled>-- Chọn thể loại --</option>
                <option value="Trữ Tình">Trữ Tình</option>
                <option value="Chill">Chill</option>
                <option value="Pop">Pop</option>
                <option value="Rap">Rap</option>
                <option value="R&B">R&B</option>
                <option value="EDM / Dance">EDM / Dance</option>
                <option value="Acoustic / Indie">Acoustic / Indie</option>
                <option value="Rock">Rock</option>
                <option value="Jazz / Blues">Jazz / Blues</option>
                <option value="Nhạc Cổ Điển">Nhạc Cổ Điển</option>
                <option value="Podcast / Talkshow">Podcast / Talkshow</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
          </div>

          <div>
             <label className="text-[10px] font-bold text-zinc-400 block mb-1 uppercase tracking-wide">Mô tả (Description)</label>
             <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Nhập mô tả thêm về bài hát hoặc video..." rows={2} className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500 transition placeholder:text-zinc-600 resize-none" />
          </div>

          <div 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-6 text-center transition-all group mt-2 ${isDragging ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-zinc-900/60 border-zinc-700 hover:border-emerald-500/50'}`}
          >
            <label className="cursor-pointer block">
              <span className={`w-12 h-12 flex items-center justify-center rounded-full mx-auto mb-3 shadow-lg transition-transform ${isDragging ? 'bg-emerald-500 text-black scale-110' : 'bg-zinc-800 text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500/20'}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-6 h-6"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              </span>
              <span className={`text-xs font-bold block mb-1 ${isDragging ? 'text-emerald-400' : 'text-emerald-400 group-hover:underline'}`}>
                {isDragging ? 'Thả file vào đây...' : 'Bấm hoặc Kéo thả tệp Media vào đây'}
              </span>
              <input ref={inputRef} type="file" accept="audio/*,video/*" onChange={handleFileChange} className="hidden" />
            </label>
            {file ? (
              <div className="text-[11px] text-zinc-300 mt-3 bg-emerald-500/10 inline-block px-3 py-1.5 rounded-lg border border-emerald-500/20 shadow-sm truncate max-w-full">
                Đã thêm: <span className="font-extrabold text-white">{file.name}</span> <br/> 
                <span className="text-zinc-500">{(file.size/1024/1024).toFixed(2)} MB</span>
              </div>
            ) : (
              <div className="text-[10px] text-zinc-500 mt-1">Giới hạn file tối đa 50MB (.mp3, .mp4,...)</div>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-800/60 mt-3">
            <button type="button" onClick={() => onClose && onClose()} className="px-4 py-2 rounded-lg hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition cursor-pointer">
              Hủy bỏ
            </button>
            <button type="submit" disabled={isUploading || !file} className="px-5 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5">
              {isUploading ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ĐANG UP...
                </>
              ) : 'TẢI LÊN NGAY'}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}