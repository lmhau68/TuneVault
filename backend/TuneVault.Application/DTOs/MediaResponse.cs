using System;

namespace TuneVault.Application.DTOs.Media
{
    public class MediaResponse
    {
        public int Id { get; set; }
        public string? Title { get; set; }
        public string? FilePath { get; set; }
        public int OwnerUserId { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? Artist { get; set; }
        public string? Genre { get; set; }
        public string? Album { get; set; }
        public string? Description { get; set; }
        public string? MediaType { get; set; } 
        public string? ThumbnailPath { get; set; }
        public int? DurationInSeconds { get; set; }
        public long? FileSizeInBytes { get; set; }
    }
}