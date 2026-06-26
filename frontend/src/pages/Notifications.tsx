import { useEffect, useState } from 'react';
import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr';
import { mediaService } from '../services/api';
import { type NotificationItem } from '../types/media';

export default function Notifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isHubActive, setIsHubActive] = useState(false);

  const fetchRestNotifications = async () => {
    try {
      const data = await mediaService.getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      console.error("Không thể tải thông báo qua REST API.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await mediaService.markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch {
      alert("Cập nhật trạng thái thông báo thất bại.");
    }
  };

  useEffect(() => {
    fetchRestNotifications();

    let connection: HubConnection | null = null;
    try {
      connection = new HubConnectionBuilder()
        .withUrl("/hubs/notifications", {
          accessTokenFactory: () => localStorage.getItem('tune_vault_token') || ''
        })
        .withAutomaticReconnect()
        .build();

      connection.start()
        .then(() => {
          setIsHubActive(true);
          connection?.on("ReceiveNotification", (notif: NotificationItem) => {
            setNotifications(prev => [notif, ...prev]);
          });
        })
        .catch(err => console.error("Lỗi đồng bộ SignalR tại trang thông báo:", err));
    } catch (err) {
      console.error("SignalR Exception:", err);
    }

    return () => {
      if (connection) {
        connection.off("ReceiveNotification");
        connection.stop();
      }
    };
  }, []);

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-white">Hộp thư thông báo</h2>
          <p className="text-zinc-400 text-xs mt-1">Cập nhật hệ thống theo thời gian thực và thông báo chia sẻ.</p>
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${isHubActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-800 text-zinc-500'}`}>
          {isHubActive ? 'SignalR Trực tiếp' : 'Chế độ REST'}
        </span>
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <p className="text-center text-zinc-500 text-sm animate-pulse">Đang đồng bộ thông báo...</p>
        ) : notifications.length > 0 ? (
          notifications.map((n) => (
            <div 
              key={n.id} 
              className={`p-4 border rounded-xl text-sm flex items-center justify-between transition ${n.isRead ? 'border-zinc-900/60 opacity-60 bg-zinc-900/10' : 'border-emerald-500/20 bg-gradient-to-r from-zinc-900 to-zinc-900/40'}`}
            >
              <div className="flex gap-4 items-start">
                <div className="shrink-0 mt-1">
                  {n.notificationType === 'SHARE_MEDIA' ? (
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/30 shadow-inner">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-300 border border-zinc-700 shadow-inner">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                    </div>
                  )}
                </div>
                <div>
                  <h4 className={`font-bold text-white ${n.isRead ? '' : 'text-emerald-400'}`}>{n.title}</h4>
                  <p className="text-zinc-300 text-xs mt-1 leading-relaxed max-w-lg">{n.message}</p>
                  <span className="text-[10px] text-zinc-500 block mt-1.5 font-medium tracking-wide uppercase">{new Date(n.createdAt).toLocaleString('vi-VN')}</span>
                </div>
              </div>
              
              {!n.isRead && (
                <button 
                  onClick={() => handleMarkAsRead(n.id)} 
                  className="text-xs font-bold text-emerald-500 hover:text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg hover:bg-emerald-500/10 transition whitespace-nowrap ml-4 cursor-pointer"
                >
                  Đánh dấu đã đọc
                </button>
              )}
            </div>
          ))
        ) : (
          <p className="text-center text-zinc-500 text-xs italic py-8">Hộp thư thông báo của bạn đang trống.</p>
        )}
      </div>
    </div>
  );
}