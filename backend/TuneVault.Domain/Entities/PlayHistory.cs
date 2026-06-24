namespace TuneVault.Domain.Entities;

public class PlayHistory
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int MediaItemId { get; set; }
    public DateTime PlayedAt { get; set; }
    public int? ProgressInSeconds { get; set; }
}