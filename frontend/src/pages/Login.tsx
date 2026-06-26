import { useState } from 'react';
import { mediaService } from '../services/api';

export default function Login() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [user, setUser] = useState({ email: '', password: '', fullName: '' });
  const [isLogging, setIsLogging] = useState(false);
  
  // State quản lý hiển thị lỗi, thành công và ẩn/hiện mật khẩu
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogging) return;
    
    // Reset thông báo mỗi lần submit
    setErrorMsg('');
    setSuccessMsg('');
    
    try {
      setIsLogging(true);
      if (isLoginMode) {
        // Ánh xạ với LoginRequestDTO
        const res = await mediaService.login({ 
            email: user.email, 
            password: user.password 
        });
        
        console.log("Dữ liệu từ Backend:", res);
        
        if (res && (res.token || res.isSuccess)) {
          if (res.token) {
            localStorage.setItem('tune_vault_token', res.token);
          }
          // Đăng nhập đúng thì chuyển hướng thẳng vào luôn không cần thông báo alert
          window.location.href = '/';
        } else {
          // Báo lỗi bằng state thay vì alert
          setErrorMsg(res.message || 'Tài khoản hoặc mật khẩu không chính xác!');
        }
      } else {
        // Ánh xạ với RegisterRequestDTO
        const res = await mediaService.register({ 
            email: user.email, 
            password: user.password, 
            displayName: user.fullName 
        });

        if (res.isSuccess) {
            // Báo thành công bằng state
            setSuccessMsg(res.message || 'Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
            setIsLoginMode(true); 
            setUser({ email: '', password: '', fullName: '' });
        } else {
            // Báo lỗi bằng state
            setErrorMsg(res.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại!');
        }
      }
    } catch (err) {
      console.error("Lỗi đăng nhập/đăng ký:", err);
      setErrorMsg('Đã xảy ra lỗi hệ thống! Vui lòng kiểm tra lại kết nối API.');
    } finally {
      setIsLogging(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 select-none">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm p-8 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl animate-fade-in relative overflow-hidden">
        
        <div className="text-center mb-2">
          <h2 className="text-white text-2xl font-black tracking-tight">
            {isLoginMode ? 'Đăng nhập hệ thống' : 'Đăng ký tài khoản'}
          </h2>
          <p className="text-zinc-400 text-xs mt-1">
            {isLoginMode 
              ? 'Nhập thông tin của bạn để kết nối với dữ liệu TuneVault' 
              : 'Tạo một không gian âm nhạc cá nhân của riêng bạn'}
          </p>
        </div>

        {/* Khu vực hiển thị thông báo thay thế cho Alert */}
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-[13px] font-bold p-3 rounded-lg text-center animate-fade-in">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 text-[13px] font-bold p-3 rounded-lg text-center animate-fade-in">
            {successMsg}
          </div>
        )}

        {!isLoginMode && (
          <div className="animate-fade-in">
            <label className="text-xs text-zinc-400 font-bold block mb-1">Tên tài khoản</label>
            <input 
              type="text" 
              required={!isLoginMode}
              value={user.fullName}
              onChange={e => setUser({...user, fullName: e.target.value})} 
              placeholder="Ví dụ: Nguyễn Văn A" 
              className="w-full p-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 transition" 
            />
          </div>
        )}

        <div>
          <label className="text-xs text-zinc-400 font-bold block mb-1">Địa chỉ Email</label>
          <input 
            type="email" 
            required
            value={user.email}
            onChange={e => setUser({...user, email: e.target.value})} 
            placeholder="name@example.com" 
            className="w-full p-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 transition" 
          />
        </div>

        <div>
          <label className="text-xs text-zinc-400 font-bold block mb-1">Mật khẩu</label>
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              required
              value={user.password}
              onChange={e => setUser({...user, password: e.target.value})} 
              placeholder="••••••••" 
              className="w-full p-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 transition pr-10" 
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-emerald-500 transition cursor-pointer"
              title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </button>
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isLogging}
          className="w-full bg-white hover:bg-zinc-200 disabled:opacity-50 text-black text-sm font-bold py-3 rounded-full transition shadow-md mt-2 cursor-pointer active:scale-95"
        >
          {isLogging ? 'Đang xử lý...' : (isLoginMode ? 'Đăng Nhập' : 'Tạo Tài Khoản')}
        </button>

        <div className="text-center mt-2 border-t border-zinc-800 pt-4">
          <p className="text-xs text-zinc-400">
            {isLoginMode ? 'Bạn chưa có tài khoản? ' : 'Bạn đã có tài khoản? '}
            <button 
              type="button"
              onClick={() => {
                setIsLoginMode(!isLoginMode);
                setUser({ email: '', password: '', fullName: '' }); 
                setErrorMsg('');
                setSuccessMsg('');
              }} 
              className="text-emerald-500 font-bold hover:underline cursor-pointer"
            >
              {isLoginMode ? 'Đăng ký ngay' : 'Đăng nhập'}
            </button>
          </p>
        </div>

      </form>
    </div>
  );
}