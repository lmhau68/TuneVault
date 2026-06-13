using TuneVault.Application.DTOs.Notifications;
using TuneVault.Application.Interfaces;
namespace TuneVault.Application.Services;

public class NotificationService
{
    // TODO: Xu ly logic nghiep vu cho module Notification
    private readonly INotificationRepository _notificationRepository;

    public NotificationService(INotificationRepository notificationRepository)
    {
        _notificationRepository = notificationRepository;
    }

    public async Task<IEnumerable<NotificationDto>> GetMyNotificationsAsync(int userId)
    {
        return await _notificationRepository.GetMyNotificationsAsync(userId);
    }

    public async Task<bool> MarkAsReadAsync(int id, int userId)
    {
        return await _notificationRepository.MarkAsReadAsync(id, userId);
    }
}
