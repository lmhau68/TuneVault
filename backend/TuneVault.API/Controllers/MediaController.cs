using Microsoft.AspNetCore.Mvc;
using TuneVault.Application.DTOs.Media;
using TuneVault.Application.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace TuneVault.API.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class MediaController : ControllerBase
{
    // TODO: Viet endpoint cho Media
    private readonly MediaService _mediaService;

        public MediaController(MediaService mediaService)
        {
            _mediaService = mediaService;
        }

        [HttpPost("upload")]
        public async Task<IActionResult> Upload([FromForm] UploadMediaRequest request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
            {
                return Unauthorized();
            }

            var currentUserId = int.Parse(userIdClaim.Value);
            // Kiểm tra file
            if (request.File == null || request.File.Length == 0)
            {
                return BadRequest("File is required.");
            }
            if (string.IsNullOrWhiteSpace(request.Title))
            {
                return BadRequest("Tile is required");
            }
            // Giới hạn 50MB
            const long maxSize = 50 * 1024 * 1024;

            if (request.File.Length > maxSize)
            {
                return BadRequest("File size exceeds 50MB.");
            }

            // Chỉ cho upload mp3/mp4
            var extension = Path.GetExtension(request.File.FileName).ToLowerInvariant();

            var allowedExtensions = new[]
            {
                ".mp3",
                ".wav",
                ".mp4",
                ".avi",
                ".mov"
            };

            if (!allowedExtensions.Contains(extension))
            {
                return BadRequest(
                    "Only .mp3, .wav, .mp4, .avi and .mov files are allowed."
                );
            }
            
            var result = await _mediaService.UploadMediaAsync(request, currentUserId);
            return Ok(result);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _mediaService.GetAllMediaAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _mediaService.GetByIdAsync(id);
            if (result == null) return NotFound("Media not found");
            return Ok(result);
        }
        
        [AllowAnonymous]
        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string keyword)
        {
            var result = await _mediaService.SearchAsync(keyword);
            return Ok(result);
        }
        // GET /api/media/my/search
        [HttpGet("my/search")]
        public async Task<IActionResult> SearchMyMedia([FromQuery] string keyword)
        {
            // Bóc ID người dùng từ Token
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int currentUserId))
            {
                return Unauthorized(new { Message = "Token không hợp lệ." });
            }

            var result = await _mediaService.SearchMyMediaAsync(keyword, currentUserId);
            return Ok(result);
        }
        // API quan trọng để stream nhạc/video

        [AllowAnonymous]
        [HttpGet("{id}/stream")]
        public async Task<IActionResult> Stream(int id)
        {
            var media = await _mediaService.GetByIdAsync(id);
            if (media == null) return NotFound("Media not found");

            // Xử lý đường dẫn file
            var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", media.FilePath!.TrimStart('/'));
            if (!System.IO.File.Exists(filePath)) return NotFound("File does not exist on server");

            var stream = new FileStream(filePath, FileMode.Open, FileAccess.Read, FileShare.Read);
            
            // enableRangeProcessing = true rất quan trọng để trình duyệt có thể tua (seek) nhạc/video
            return File(stream, "application/octet-stream", enableRangeProcessing: true);
        }
}
