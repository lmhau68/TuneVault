using TuneVault.Application.DTOs.Notifications;

namespace TuneVault.Application.Interfaces;

public interface INotificationRepository
{
    // TODO: Khai bao cac method cho NotificationRepository
    Task<IEnumerable<NotificationDto>> GetMyNotificationsAsync(int userId);
    Task<bool> MarkAsReadAsync(int id, int userId);
    Task<bool> CreateNotificationAsync(int userId, string title, string message, string type, int relatedId);
}
