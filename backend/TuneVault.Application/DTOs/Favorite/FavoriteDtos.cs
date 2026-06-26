namespace TuneVault.Application.DTOs.Favorite;

public class FavoriteMediaResponseDto
{
    public int FavoriteId { get; set; }
    public int MediaItemId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Artist { get; set; }
    public string? Album { get; set; }
    public string? Genre { get; set; }
    public string MediaType { get; set; } = string.Empty;
    public string? ThumbnailPath { get; set; }
    public int? DurationInSeconds { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class ToggleFavoriteResponseDto
{
    public bool IsFavorited { get; set; }
    public string Message { get; set; } = string.Empty;
}

public class FavoriteStatusDto
{
    public int MediaItemId { get; set; }
    public bool IsFavorited { get; set; }
}