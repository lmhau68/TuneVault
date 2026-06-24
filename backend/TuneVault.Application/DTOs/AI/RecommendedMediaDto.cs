namespace TuneVault.Application.DTOs.AI;

public class RecommendedMediaDto
{
    public int Id { get; set; }
    public string? Title { get; set; }
    public string? Artist { get; set; }
    public string? Album { get; set; }
    public string? Genre { get; set; }
    public string? ThumbnailPath { get; set; }
    public string? MediaType { get; set; }
    public string? FilePath { get; set; }
}