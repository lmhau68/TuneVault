using System.Security.Cryptography.X509Certificates;

namespace TuneVault.Domain.Entities;

public class Notification
{
<<<<<<< HEAD
    // TODO: Map voi bang tuong ung trong database/schema.sql
    public int Id { get; set; }
    public int UserId { get; set; }
    public string? Title { get; set; }
    public string? Messahe { get; set; }
    public string? NotificationType { get; set; }
    public int RelatedId { get; set; }
    public bool IsRead { get; set; }
    public DateTime CreatedAt{ get; set; }
}
=======
    public int Id { get; set; }

    public int UserId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Message { get; set; } = string.Empty;

    public string NotificationType { get; set; } = string.Empty;

    public int? RelatedEntityId { get; set; }

    public bool IsRead { get; set; }

    public DateTime CreatedAt { get; set; }
}
>>>>>>> 7f741807eeafd09bea0dca8f6fae10981ea94eb4
