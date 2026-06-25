namespace TuneVault.Domain.Entities;

public class PlaylistTrack
{
    public int Id { get; set; }

    public int PlaylistId { get; set; }

    public int MediaItemId { get; set; }

    public int Position { get; set; }

    public DateTime AddedAt { get; set; }
}
