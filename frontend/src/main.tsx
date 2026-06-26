import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

(() => {
  const tokenKey = 'tune_vault_token';
  const token = localStorage.getItem(tokenKey);
  let isTokenExpired = false;

  // Kiểm tra xem token hiện tại đã hết hạn hay chưa
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Nếu thời gian hết hạn (exp) nhỏ hơn hoặc bằng thời gian hiện tại -> Đã hết hạn
      if (payload.exp * 1000 <= Date.now()) {
        isTokenExpired = true;
      }
    } catch {
      isTokenExpired = true; // Token lỗi định dạng -> coi như hết hạn
    }
  }

  // ĐÃ XÓA CHỨC NĂNG TẠM: Không còn tự động tạo Fake Token nữa.
  // Backend đã hỗ trợ Auth thật, nếu lỗi thì chỉ xóa token đi, App.tsx sẽ tự đẩy về /login
  if (!token || isTokenExpired) {
    localStorage.removeItem(tokenKey);
  }
})();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);