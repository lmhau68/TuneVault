import { useEffect, useState } from 'react';
import { mediaService } from '../services/api';
import { type UserProfile } from '../types/media';

interface ExtendedUserProfile extends UserProfile {
  displayName?: string;
  fullName?: string;
  FullName?: string;
  fullname?: string;
  Email?: string;
  emailAddress?: string;
  UserName?: string;
  Bio?: string;
  description?: string;
  Description?: string;
  DisplayName?: string;
  AvatarUrl?: string;
}

export default function Profile() {
  const [profile, setProfile] = useState<ExtendedUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Trạng thái chỉnh sửa Họ và tên
  const [isEditingFullName, setIsEditingFullName] = useState(false);
  const [fullNameInput, setFullNameInput] = useState('');
  
  // Trạng thái chỉnh sửa Tiểu sử (Bio/Description)
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState('');

  // Trạng thái chỉnh sửa Email
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailInput, setEmailInput] = useState('');

  // Trạng thái chỉnh sửa Tên hiển thị (DisplayName)
  const [isEditingDisplayName, setIsEditingDisplayName] = useState(false);
  const [displayNameInput, setDisplayNameInput] = useState('');

  // Trạng thái chỉnh sửa Ảnh đại diện (AvatarUrl)
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [avatarUrlInput, setAvatarUrlInput] = useState('');

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = () => {
    setLoading(true);
    mediaService.getProfile()
      .then((data) => {
        const extData = data as any;
        setProfile(extData);
        
        // Quét toàn diện các định dạng dữ liệu có thể có từ Backend
        const fetchedFullName = extData.fullName || extData.FullName || extData.fullname || '';
        const fetchedBio = extData.bio || extData.Bio || extData.description || extData.Description || '';
        const fetchedEmail = extData.email || extData.Email || extData.emailAddress || '';
        const fetchedDisplayName = extData.displayName || extData.DisplayName || extData.username || extData.UserName || '';
        const fetchedAvatar = extData.avatarUrl || extData.AvatarUrl || '';

        setFullNameInput(fetchedFullName);
        setBioInput(fetchedBio);
        setEmailInput(fetchedEmail);
        setDisplayNameInput(fetchedDisplayName);
        setAvatarUrlInput(fetchedAvatar);
        
        setLoading(false);
      })
      .catch((err) => {
        console.error("Lỗi lấy hồ sơ:", err);
        setLoading(false);
      });
  };

  const handleLogout = () => {
    localStorage.removeItem('tune_vault_token');
    window.location.href = '/login';
  };

  // Hàm lưu dùng chung cho tất cả các trường để tránh mất dữ liệu khi PUT API
  const saveAllFields = async (updatedFields: any) => {
    try {
      const payload = {
        fullName: fullNameInput,
        bio: bioInput,
        displayName: displayNameInput,
        email: emailInput,
        avatarUrl: avatarUrlInput,
        ...updatedFields
      };
      await mediaService.updateProfile(payload);
      setProfile({ ...profile, ...payload });
      return true;
    } catch (error) {
      alert("Cập nhật thông tin thất bại. Vui lòng kiểm tra lại!");
      return false;
    }
  };

  const handleSaveFullName = async () => {
    const success = await saveAllFields({ fullName: fullNameInput });
    if (success) setIsEditingFullName(false);
  };

  const handleSaveBio = async () => {
    const success = await saveAllFields({ bio: bioInput });
    if (success) setIsEditingBio(false);
  };

  const handleSaveEmail = async () => {
    const success = await saveAllFields({ email: emailInput });
    if (success) setIsEditingEmail(false);
  };

  const handleSaveDisplayName = async () => {
    const success = await saveAllFields({ displayName: displayNameInput });
    if (success) setIsEditingDisplayName(false);
  };

  const handleSaveAvatarUrl = async () => {
    const success = await saveAllFields({ avatarUrl: avatarUrlInput });
    if (success) setIsEditingAvatar(false);
  };

  if (loading) {
    return <div className="p-6 text-zinc-500 text-sm animate-pulse text-center">Đang tải cấu hình hồ sơ...</div>;
  }

  return (
    <div className="animate-fade-in p-2 max-w-xl">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-white">Hồ sơ cá nhân</h2>
        <p className="text-zinc-400 text-xs mt-1">Quản lý danh tính và thông tin tài khoản TuneVault của bạn.</p>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-6 shadow-xl">
        {/* Khu vực Avatar */}
        <div className="flex flex-col items-center gap-3 shrink-0">
          <div className="relative w-24 h-24 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-3xl shadow-xl group overflow-visible">
            {profile?.avatarUrl ? (
              <img src={profile.avatarUrl} alt="avatar" className="w-full h-full rounded-full object-cover"/>
            ) : (
              '👤'
            )}
            <button 
              onClick={() => setIsEditingAvatar(!isEditingAvatar)}
              className="absolute bottom-0 right-0 w-7 h-7 bg-emerald-500 hover:bg-emerald-400 text-black rounded-full flex items-center justify-center shadow-md transition-all active:scale-90 border-2 border-zinc-950 cursor-pointer group-hover:scale-105"
              title="Thay đổi ảnh đại diện"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </button>
          </div>
          
          {isEditingAvatar && (
            <div className="flex flex-col gap-2 w-full max-w-[200px] animate-fade-in mt-1">
              <input 
                type="text"
                value={avatarUrlInput}
                onChange={(e) => setAvatarUrlInput(e.target.value)}
                className="bg-zinc-800 text-xs text-white border border-zinc-700 rounded px-2 py-1.5 focus:outline-none focus:border-emerald-500 w-full"
                placeholder="Dán link ảnh (URL)..."
                autoFocus
              />
              <div className="flex justify-center gap-3">
                <button onClick={handleSaveAvatarUrl} className="text-emerald-400 hover:text-emerald-300 text-[11px] font-bold cursor-pointer">Lưu link ảnh</button>
                <button onClick={() => setIsEditingAvatar(false)} className="text-zinc-400 hover:text-zinc-300 text-[11px] cursor-pointer">Hủy</button>
              </div>
            </div>
          )}
        </div>

        {/* Thông tin tên tuổi */}
        <div className="text-center sm:text-left flex-1 w-full min-w-0 space-y-1">
          
          {/* Tên hiển thị (DisplayName) */}
          <div className="flex items-center justify-center sm:justify-start gap-2 min-h-[32px]">
            {isEditingDisplayName ? (
              <div className="flex items-center gap-1.5 w-full max-w-xs">
                <input 
                  type="text"
                  value={displayNameInput}
                  onChange={(e) => setDisplayNameInput(e.target.value)}
                  className="bg-zinc-800 text-sm text-white border border-zinc-700 rounded px-2 py-1 focus:outline-none focus:border-emerald-500 flex-1"
                  placeholder="Nhập tên hiển thị..."
                  autoFocus
                />
                <button onClick={handleSaveDisplayName} className="text-emerald-400 hover:text-emerald-300 text-xs font-bold px-1 whitespace-nowrap cursor-pointer">Lưu</button>
                <button onClick={() => setIsEditingDisplayName(false)} className="text-zinc-400 hover:text-zinc-300 text-xs px-1 whitespace-nowrap cursor-pointer">Hủy</button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditingDisplayName(true)}>
                <p className="text-xl font-black text-white tracking-wide truncate">
                  {displayNameInput || "Chưa có tên hiển thị"}
                </p>
                <button 
                  className="w-6 h-6 bg-zinc-800 text-zinc-400 hover:text-emerald-400 border border-zinc-700 rounded flex items-center justify-center transition-all shadow-sm active:scale-90"
                  title="Chỉnh sửa tên hiển thị"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Họ và tên (FullName) */}
          <div className="flex items-center justify-center sm:justify-start gap-2 min-h-[24px]">
            {isEditingFullName ? (
              <div className="flex items-center gap-1.5 w-full max-w-xs">
                <input 
                  type="text"
                  value={fullNameInput}
                  onChange={(e) => setFullNameInput(e.target.value)}
                  className="bg-zinc-800 text-xs text-white border border-zinc-700 rounded px-2 py-0.5 focus:outline-none focus:border-emerald-500 flex-1"
                  placeholder="Nhập họ và tên..."
                  autoFocus
                />
                <button onClick={handleSaveFullName} className="text-emerald-400 hover:text-emerald-300 text-xs font-bold px-1 whitespace-nowrap cursor-pointer">Lưu</button>
                <button onClick={() => setIsEditingFullName(false)} className="text-zinc-400 hover:text-zinc-300 text-xs px-1 whitespace-nowrap cursor-pointer">Hủy</button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditingFullName(true)}>
                {fullNameInput ? (
                  <span className="text-sm text-zinc-400 font-medium truncate">{fullNameInput}</span>
                ) : (
                  <span className="text-xs text-zinc-500 italic">Chưa có họ tên</span>
                )}
                <button 
                  className="w-5 h-5 bg-zinc-800 text-zinc-400 hover:text-emerald-400 border border-zinc-700 rounded flex items-center justify-center transition-all shadow-sm active:scale-90"
                  title="Chỉnh sửa họ tên"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          <p className="text-zinc-500 text-xs mt-1.5 font-medium">ID Người dùng: #{profile?.id || 'Đang cập nhật'}</p>
          <p className="text-emerald-500 text-[11px] font-bold mt-1 uppercase tracking-wider">Tài khoản đã xác minh</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Khối tiểu sử (Bio / Description) */}
        <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-800/80 text-sm space-y-2 relative group">
          <div className="flex items-center justify-between">
            <div className="text-xs text-zinc-500 font-bold uppercase tracking-wider mb-1">Tiểu sử / Description</div>
            {!isEditingBio && (
              <button 
                onClick={() => setIsEditingBio(true)}
                className="text-zinc-400 hover:text-emerald-400 transition-all cursor-pointer bg-zinc-800 p-1.5 rounded"
                title="Chỉnh sửa tiểu sử"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                  <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </button>
            )}
          </div>
          
          {isEditingBio ? (
            <div className="space-y-2 animate-fade-in">
              <textarea 
                value={bioInput}
                onChange={(e) => setBioInput(e.target.value)}
                className="w-full bg-zinc-900 text-sm text-zinc-200 border border-zinc-700 rounded-lg p-2 focus:outline-none focus:border-emerald-500 resize-none"
                rows={3}
                placeholder="Nhập vài dòng giới thiệu bản thân..."
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <button onClick={() => setIsEditingBio(false)} className="text-xs text-zinc-400 hover:text-zinc-300 px-2 py-1 cursor-pointer">Hủy</button>
                <button onClick={handleSaveBio} className="text-xs bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-3 py-1 rounded-full shadow transition-all active:scale-95 cursor-pointer">Lưu</button>
              </div>
            </div>
          ) : bioInput ? (
            <p className="text-zinc-300 italic leading-relaxed whitespace-pre-line">
              "{bioInput}"
            </p>
          ) : (
            <p className="text-zinc-500 text-xs italic py-1">Chưa có tiểu sử.</p>
          )}
        </div>

        {/* Khối thông tin liên kết */}
        <div className="text-xs text-zinc-500 flex flex-col gap-3 px-1">
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 min-h-[24px]">
            <span>Email liên kết:</span>
            {isEditingEmail ? (
              <div className="flex items-center gap-1.5 flex-1 max-w-xs">
                <input 
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="bg-zinc-800 text-xs text-white border border-zinc-700 rounded px-2 py-0.5 focus:outline-none focus:border-emerald-500 flex-1"
                  placeholder="Nhập email..."
                  autoFocus
                />
                <button onClick={handleSaveEmail} className="text-emerald-400 hover:text-emerald-300 text-xs font-bold px-1 whitespace-nowrap cursor-pointer">Lưu</button>
                <button onClick={() => setIsEditingEmail(false)} className="text-zinc-400 hover:text-zinc-300 text-xs px-1 whitespace-nowrap cursor-pointer">Hủy</button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditingEmail(true)}>
                <span className="text-zinc-300 font-medium truncate">{emailInput || 'Chưa có email...'}</span>
                <button 
                  className="w-5 h-5 bg-zinc-800 text-zinc-400 hover:text-emerald-400 border border-zinc-700 rounded flex items-center justify-center transition-all shadow-sm active:scale-90"
                  title="Chỉnh sửa Email"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          <p>Chế độ bảo mật: <span className="text-emerald-500 font-medium">Mã hóa Token JWT End-to-End</span></p>
        </div>

        <div className="pt-4">
          <button 
            onClick={handleLogout}
            className="bg-red-600/10 hover:bg-red-600/20 text-red-400 text-xs font-bold px-4 py-2 rounded-lg transition-all border border-red-500/20 cursor-pointer active:scale-95"
          >
            Đăng xuất tài khoản
          </button>
        </div>
      </div>
    </div>
  );
}