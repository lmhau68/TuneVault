import React, { useState } from 'react';

interface CreatePlaylistModalProps {
  onClose: () => void;
  onSubmit: (name: string, description: string, isPublic: boolean) => void;
}

export default function CreatePlaylistModal({ onClose, onSubmit }: CreatePlaylistModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isPublic === null) return;
    setIsSubmitting(true);
    onSubmit(name, description, isPublic);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#181818] w-full max-w-md rounded-2xl p-6 shadow-2xl border border-zinc-800">
        <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6">
          <span className="text-emerald-500">🎶</span> Tạo Danh Sách Phát Mới
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-1.5">
              Tên danh sách phát <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ví dụ: Nhạc chill cuối tuần, V-Pop gây nghiện..."
              className="w-full bg-[#242424] border border-transparent focus:border-zinc-600 text-white text-sm px-4 py-3 rounded-lg outline-none transition placeholder:text-zinc-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-1.5">
              Quyền riêng tư <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4 mt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="privacy" 
                  checked={isPublic === true} 
                  onChange={() => setIsPublic(true)} 
                  className="w-4 h-4 accent-emerald-500 cursor-pointer" 
                  required
                />
                <span className="text-sm text-white">Công khai (Public)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="privacy" 
                  checked={isPublic === false} 
                  onChange={() => setIsPublic(false)} 
                  className="w-4 h-4 accent-emerald-500 cursor-pointer" 
                />
                <span className="text-sm text-white">Riêng tư (Private)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-zinc-400 mb-1.5 mt-2">
              Mô tả ngắn gọn
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập vài dòng giới thiệu về danh sách phát này của bạn..."
              rows={3}
              className="w-full bg-[#242424] border border-transparent focus:border-zinc-600 text-white text-sm px-4 py-3 rounded-lg outline-none transition placeholder:text-zinc-500 resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 mt-6 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-sm font-bold text-zinc-400 hover:text-white px-4 py-2 transition cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={!name.trim() || isPublic === null || isSubmitting}
              className="bg-white hover:bg-zinc-200 text-black text-sm font-bold px-6 py-2.5 rounded-full transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? 'Đang khởi tạo...' : 'Tạo mới ngay'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}