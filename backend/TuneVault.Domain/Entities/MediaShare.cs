namespace TuneVault.Domain.Entities;

public class MediaShare
{
    // TODO: Map voi bang tuong ung trong database/schema.sql
    public int Id { get; set; }
    public int SenderUserId { get; set; }
    public int ReceiverUserId { get; set; } 
    public int MediaItemId { get; set; }
    public int PlaylistId{ get; set; }
    public string? Message { get; set; }

    public DateTime SharedAt { get; set; }
}
