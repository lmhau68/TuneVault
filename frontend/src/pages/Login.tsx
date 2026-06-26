import { useState } from 'react';
import { mediaService } from '../services/api';

export default function Login() {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [user, setUser] = useState({ email: '', password: '', fullName: '' });
  const [isLogging, setIsLogging] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogging) return;
    
    try {
      setIsLogging(true);
      if (isLoginMode) {
        // Ánh xạ với LoginRequestDTO
        const res = await mediaService.login({ 
            email: user.email, 
            password: user.password 
        });
        
        console.log("Dữ liệu từ Backend:", res); // Thêm log để bạn dễ debug nếu cần
        
        // ĐÃ SỬA: Nới lỏng điều kiện (chỉ cần có token hoặc isSuccess = true)
        if (res && (res.token || res.isSuccess)) {
          if (res.token) {
            localStorage.setItem('tune_vault_token', res.token);
          }
          alert(res.message || 'Đăng nhập hệ thống thành công!');
          
          // ĐÃ SỬA: Dùng href để ép trình duyệt load lại thẳng vào trang chủ
          window.location.href = '/';
        } else {
          alert(res.message || 'Tài khoản hoặc mật khẩu không chính xác!');
        }
      } else {
        // Ánh xạ với RegisterRequestDTO
        const res = await mediaService.register({ 
            email: user.email, 
            password: user.password, 
            displayName: user.fullName 
        });

        if (res.isSuccess) {
            alert(res.message || 'Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
            setIsLoginMode(true); 
            setUser({ email: '', password: '', fullName: '' });
        } else {
            alert(res.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại!');
        }
      }
    } catch (err) {
      console.error("Lỗi đăng nhập/đăng ký:", err);
      alert('Đã xảy ra lỗi hệ thống! Vui lòng kiểm tra lại kết nối API.');
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
          <input 
            type="password" 
            required
            value={user.password}
            onChange={e => setUser({...user, password: e.target.value})} 
            placeholder="••••••••" 
            className="w-full p-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 transition" 
          />
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