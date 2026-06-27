import React, { useState, useRef, useEffect } from 'react';
import { mediaService } from '../services/api';

export default function UploadModal({ onClose, onUploaded }: any) {
  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [genre, setGenre] = useState('');
  const [description, setDescription] = useState('');
  
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setFile(null); 
    setThumbnail(null); 
    setTitle(''); 
    setArtist(''); 
    setAlbum(''); 
    setGenre(''); 
    setDescription('');
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (f) setFile(f);
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (f) setThumbnail(f);
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
      
      // Gửi Description lên Backend
      if (description) fd.append('Description', description);
      
      fd.append('File', file);

      // Gửi Thumbnail lên Backend
      if (thumbnail) fd.append('Thumbnail', thumbnail);

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
      className="absolute top-full right-0 mt-3 w-[95vw] sm:w-[500px] md:w-[700px] lg:w-[750px] bg-[#282828] border border-zinc-700 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[100] flex flex-col max-h-[85vh] overflow-hidden cursor-default animate-fade-in origin-top-right text-left" 
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between p-4 border-b border-zinc-700/60 shrink-0 bg-zinc-800/50">
        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4 text-emerald-500"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
          Tải lên tệp Media
        </h3>
        <button onClick={() => onClose && onClose()} className="text-zinc-400 hover:text-white hover:bg-zinc-700 w-8 h-8 rounded-full flex items-center justify-center transition cursor-pointer">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4.5 h-4.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <div className="p-4 md:p-5 overflow-y-auto custom-scrollbar">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          
          <div className="flex flex-col md:flex-row gap-6">
            
            {/* CỘT TRÁI: KHU VỰC ẢNH VÀ TỆP */}
            <div className="w-full md:w-5/12 flex flex-col gap-4">
              
              {/* KHỐI THUMBNAIL LÀM MỚI */}
              <div>
                <label className="text-[10px] font-bold text-zinc-400 block mb-2 uppercase tracking-wide">Ảnh bìa (Thumbnail)</label>
                <div className="relative w-full aspect-square rounded-xl border-2 border-dashed border-zinc-700 hover:border-emerald-500/50 bg-zinc-900/60 overflow-hidden flex flex-col items-center justify-center transition-all group cursor-pointer shadow-inner">
                  <input type="file" accept="image/*" onChange={handleThumbnailChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" title="Chọn ảnh bìa" />
                  
                  {thumbnail ? (
                    <>
                      <img src={URL.createObjectURL(thumbnail)} alt="Thumb" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center z-20 pointer-events-none">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-8 h-8 text-white mb-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                          <span className="text-xs font-bold text-white">Đổi ảnh khác</span>
                      </div>
                      
                      <button 
                        type="button" 
                        onClick={(e) => { e.preventDefault(); setThumbnail(null); }} 
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500/90 hover:bg-red-500 text-white rounded-full flex items-center justify-center z-30 transition cursor-pointer shadow-md hover:scale-110" 
                        title="Xóa ảnh bìa"
                      >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-4 h-4"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-4 text-center pointer-events-none">
                      <span className="w-12 h-12 rounded-full bg-zinc-800 text-emerald-400 flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-300">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                      </span>
                      <span className="text-xs font-bold text-emerald-400 group-hover:underline block mb-1">Tải ảnh bìa lên</span>
                      <span className="text-[10px] text-zinc-500">Tỷ lệ 1:1 (Tùy chọn)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* KHỐI KÉO THẢ TỆP MEDIA */}
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative flex-1 min-h-[140px] border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center transition-all group ${isDragging ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' : 'bg-zinc-900/60 border-zinc-700 hover:border-emerald-500/50'}`}
              >
                <input ref={inputRef} type="file" accept="audio/*,video/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" title="Chọn file media" />
                
                {file ? (
                  <div className="flex flex-col items-center justify-center z-20 pointer-events-none w-full">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2 shadow-inner border border-emerald-500/30">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                    </div>
                    <div className="text-[11px] text-zinc-300 bg-zinc-950/50 px-3 py-2 rounded-lg border border-zinc-800 shadow-sm w-full">
                      <p className="font-extrabold text-white truncate w-full">{file.name}</p>
                      <p className="text-zinc-500 mt-0.5">{(file.size/1024/1024).toFixed(2)} MB</p>
                    </div>
                    <p 
                      className="text-[10px] text-emerald-400 font-bold mt-2 hover:underline cursor-pointer pointer-events-auto relative z-30" 
                      onClick={(e) => { e.preventDefault(); setFile(null); }}
                    >
                      Xóa & Chọn tệp khác
                    </p>
                  </div>
                ) : (
                  <div className="z-20 pointer-events-none">
                    <span className={`w-10 h-10 flex items-center justify-center rounded-full mx-auto mb-2 shadow-lg transition-transform ${isDragging ? 'bg-emerald-500 text-black scale-110' : 'bg-zinc-800 text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500/20'}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                    </span>
                    <span className={`text-[11px] font-bold block mb-1 ${isDragging ? 'text-emerald-400' : 'text-emerald-400 group-hover:underline'}`}>
                      {isDragging ? 'Thả file vào đây...' : 'Kéo thả Audio/Video'}
                    </span>
                    <span className="text-[9px] text-zinc-500 block">Tối đa 50MB</span>
                  </div>
                )}
              </div>

            </div>

            {/* CỘT PHẢI: FORM THÔNG TIN CHI TIẾT */}
            <div className="w-full md:w-7/12 flex flex-col space-y-3.5">
              
              <div>
                <label className="text-[10px] font-bold text-zinc-400 block mb-1.5 uppercase tracking-wide">
                  Tiêu đề <span className="text-red-500">*</span>
                </label>
                <input required value={title} onChange={e => setTitle(e.target.value)} placeholder="Tên bài hát / video..." className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500 transition placeholder:text-zinc-600" />
              </div>
              
              <div className="grid grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 block mb-1.5 uppercase tracking-wide">Nghệ sĩ thể hiện</label>
                  <input value={artist} onChange={e => setArtist(e.target.value)} placeholder="Tên nghệ sĩ..." className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500 transition placeholder:text-zinc-600" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-400 block mb-1.5 uppercase tracking-wide">Thuộc Album</label>
                  <input value={album} onChange={e => setAlbum(e.target.value)} placeholder="Tên Album..." className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500 transition placeholder:text-zinc-600" />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-400 block mb-1.5 uppercase tracking-wide">Thể loại</label>
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

              <div className="flex-1 flex flex-col">
                <label className="text-[10px] font-bold text-zinc-400 block mb-1.5 uppercase tracking-wide">Mô tả (Description)</label>
                <textarea 
                  value={description} 
                  onChange={e => setDescription(e.target.value)} 
                  placeholder="Nhập mô tả chi tiết, lời bài hát hoặc thông điệp bạn muốn truyền tải..." 
                  className="w-full flex-1 min-h-[100px] px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500 transition placeholder:text-zinc-600 resize-none" 
                />
              </div>

            </div>
          </div>

          {/* FOOTER BUTTONS */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800/60 mt-1">
            <button type="button" onClick={() => onClose && onClose()} className="px-5 py-2.5 rounded-full hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition cursor-pointer">
              Hủy bỏ
            </button>
            <button type="submit" disabled={isUploading || !file} className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black disabled:opacity-50 disabled:cursor-not-allowed transition shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-95 cursor-pointer flex items-center gap-2">
              {isUploading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  ĐANG XỬ LÝ...
                </>
              ) : 'XÁC NHẬN TẢI LÊN'}
            </button>
          </div>

        </form>
      </div>

    </div>
  );
}