namespace TuneVault.Application.DTOs.Notifications;

public class NotificationDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string? Title { get; set; }
    public string? Message { get; set; }
    public string? NotificationType { get; set; }
    public int RelatedId { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt { get; set; }
}