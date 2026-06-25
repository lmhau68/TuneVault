namespace TuneVault.Application.DTOs.Playlists;

public class PlaylistResponse
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? CoverImagePath { get; set; }
    public bool IsPublic { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
    public List<PlaylistTrackResponse> Tracks { get; set; } = new();
}

public class PlaylistTrackResponse
{
    public int MediaItemId { get; set; }
    public int Position { get; set; }
    public DateTime AddedAt { get; set; }
}