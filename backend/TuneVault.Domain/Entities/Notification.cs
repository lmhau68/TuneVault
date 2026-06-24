using System.Security.Cryptography.X509Certificates;

namespace TuneVault.Domain.Entities;

public class Notification
{
    // TODO: Map voi bang tuong ung trong database/schema.sql
    public int Id { get; set; }
    public int UserId { get; set; }
    public string? Title { get; set; }
    public string? Message { get; set; }
    public string? NotificationType { get; set; }
    public int RelatedId { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt{ get; set; }
}
