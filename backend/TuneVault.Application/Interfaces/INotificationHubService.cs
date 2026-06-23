namespace TuneVault.Application.Interfaces;

public interface INotificationHubService
{
    // Hàm này sẽ bắn thông báo realtime tới một User cụ thể
    Task SendNotificationToUserAsync(int userId, string title, string message);
    Task SendNotificationToGroupAsync(int creatorId, string title, string message);
}