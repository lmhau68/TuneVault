using Microsoft.AspNetCore.Http;

namespace TuneVault.Application.DTOs.Media
{
    public class UploadMediaRequest
    {
        public string Title { get; set; }
        public IFormFile File { get; set; } // Nhận file từ Client
        public string? Artist { get; set; }
        public string? Genre { get; set; }
    }
}