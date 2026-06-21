namespace TuneVault.Application.DTOs.Playlists;

public class PlaylistResponse
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public bool IsPublic { get; set; }

    public DateTime CreatedAt { get; set; }
}