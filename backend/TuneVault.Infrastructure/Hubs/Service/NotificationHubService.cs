
using Microsoft.AspNetCore.SignalR;
using TuneVault.Application.Interfaces;

namespace TuneVault.Infrastructure.Hubs.Service;

public class NotificationHubService : INotificationHubService
{
    private readonly IHubContext<NotificationHub> _hubContext;

    public NotificationHubService(IHubContext<NotificationHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task SendNotificationToUserAsync(int userId, string title, string message)
    {
        // Gửi tới đúng ID của người nhận thông qua kênh "ReceiveNotification"
        // Lưu ý: userId.ToString() sẽ hoạt động hoàn hảo khi bạn setup xong JWT Auth.
        await _hubContext.Clients.User(userId.ToString()).SendAsync("ReceiveNotification", new
        {
            Title = title,
            Message = message,
            Timestamp = DateTime.UtcNow
        });
    }
}