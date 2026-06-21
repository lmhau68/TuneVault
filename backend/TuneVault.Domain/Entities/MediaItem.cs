using System;

namespace TuneVault.Domain.Entities;

public class MediaItem
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string FileUrl { get; set; } = string.Empty;

    public int UploadedBy { get; set; }

    public DateTime CreatedAt { get; set; }

    public string? Artist { get; set; }

    public string? Genre { get; set; }

    public string? Album { get; set; }
}