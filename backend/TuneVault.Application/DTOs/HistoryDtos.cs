namespace TuneVault.Application.DTOs;

public class PlayHistoryResponseDto
{
    public int Id { get; set; }
    public int MediaItemId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Artist { get; set; }
    public string? Album { get; set; }
    public string? Genre { get; set; }
    public string MediaType { get; set; } = string.Empty;
    public string? ThumbnailPath { get; set; }
    public int? DurationInSeconds { get; set; }
    public int? ProgressInSeconds { get; set; }
    public DateTime PlayedAt { get; set; }
}

public class RecordPlayHistoryRequestDto
{
    public int MediaItemId { get; set; }
    public int? ProgressInSeconds { get; set; }
}