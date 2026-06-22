using Microsoft.AspNetCore.Http;

namespace TuneVault.Application.DTOs.Media
{
    public class UploadMediaRequest
    {
        public string Title { get; set; } = string.Empty;

        public string? Artist { get; set; }

        public string? Genre { get; set; }

        public IFormFile File { get; set; } = default!;
    }
}