namespace TuneVault.Domain.Entities;

public class MediaItem
{
<<<<<<< HEAD
    public int Id { get; set; }

    public int OwnerUserId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Artist { get; set; }

    public string? Genre { get; set; }

    public string? Album { get; set; }

    public string? Description { get; set; }

    public string MediaType { get; set; } = string.Empty;

    public string FilePath { get; set; } = string.Empty;

    public string? ThumbnailPath { get; set; }

    public int? DurationInSeconds { get; set; }

    public long? FileSizeInBytes { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

}
=======
    // TODO: Map voi bang tuong ung trong database/schema.sql
}
>>>>>>> main
