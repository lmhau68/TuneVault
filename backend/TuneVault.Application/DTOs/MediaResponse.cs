using System;

namespace TuneVault.Application.DTOs.Media
{
    public class MediaResponse
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string FilePath { get; set; } = string.Empty;
        public int OwnerUserId { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? Artist { get; set; }
        public string? Genre { get; set; }
    }
}