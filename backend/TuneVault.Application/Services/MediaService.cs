using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using TuneVault.Application.DTOs.Media;
using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Services;

public class MediaService
{
    // TODO: Xu ly logic nghiep vu cho module Media

    private readonly IMediaRepository _mediaRepository;
    private readonly INotificationHubService _notificationHubService;

        public MediaService(IMediaRepository mediaRepository,INotificationHubService notificationHubService)
        {
            _mediaRepository = mediaRepository;
            _notificationHubService = notificationHubService;
        }

        public async Task<MediaResponse> UploadMediaAsync(UploadMediaRequest request, int userId)
        {
            // 1. Phân tích đuôi file TRƯỚC để biết là Audio hay Video
            var extension = Path.GetExtension(request.File.FileName).ToLowerInvariant();
            var allowedExtensions = new[]
            {
                ".mp3", ".wav", ".mp4", ".avi", ".mov"
            };

            if (!allowedExtensions.Contains(extension))
            {
                throw new ArgumentException("Only mp3, wav, mp4, avi, mov files are allowed.");
            }

            string mediaType = (extension == ".mp4" || extension == ".avi" || extension == ".mov") 
                                ? "Video" 
                                : "Audio";

            // 2. Tạo đường dẫn động theo loại Media ("audio" hoặc "video")
            string subFolder = mediaType.ToLower(); 
            var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", subFolder);
            
            // Tự động tạo folder nếu chưa có
            if (!Directory.Exists(uploadPath)) Directory.CreateDirectory(uploadPath);

            var fileName = $"{Guid.NewGuid()}_{request.File.FileName}";
            var filePath = Path.Combine(uploadPath, fileName);

            // 3. Copy file vào đúng thư mục (audio/ hoặc video/)
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await request.File.CopyToAsync(stream);
            }

            // 4. Lưu thông tin vào Database với FilePath đã được cập nhật chuẩn xác
            var media = new MediaItem
            {
                Title = request.Title,
                OwnerUserId = userId,
                Artist = request.Artist,
                Genre = request.Genre,
                Album = request.Album,
                MediaType = mediaType,
                FilePath = $"/uploads/{subFolder}/{fileName}", // <-- Đường dẫn cực chuẩn để lưu DB
                FileSizeInBytes = request.File.Length
            };

            var newId = await _mediaRepository.CreateAsync(media);
            media.Id = newId;
            media.CreatedAt = DateTime.Now;

            // --- Bắn thông báo SignalR ---
            try 
            {
                await _notificationHubService.SendNotificationToGroupAsync(
                    userId,
                    "New Media Upload",
                    $"{media.Title} has been uploaded."
                );
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[CẢNH BÁO] Lỗi bắn thông báo SignalR cho user {userId}: {ex.Message}");
            }

            return MapToResponse(media);
        }

        public async Task<IEnumerable<MediaResponse>> GetAllMediaAsync()
        {
            var mediaItems = await _mediaRepository.GetAllAsync();
            return mediaItems.Select(m => MapToResponse(m));
        }

        public async Task<MediaResponse?> GetByIdAsync(int id)
        {
            var media = await _mediaRepository.GetByIdAsync(id);
            if (media == null) return null;
            return MapToResponse(media);
        }

        public async Task<IEnumerable<MediaResponse>> SearchAsync(string keyword)
        {
            var mediaItems = await _mediaRepository.SearchAsync(keyword);
            return mediaItems.Select(m => MapToResponse(m));
        }
        public async Task<IEnumerable<MediaResponse>> SearchMyMediaAsync(string keyword, int userId)
        {
            var mediaItems = await _mediaRepository.SearchMyMediaAsync(keyword, userId);
            return mediaItems.Select(m => MapToResponse(m));
        }
        // Hàm phụ trợ map từ Entity sang DTO
        private MediaResponse MapToResponse(MediaItem media)
        {
            return new MediaResponse
            {
                Id = media.Id,
                Title = media.Title,
                FilePath = media.FilePath,
                OwnerUserId = media.OwnerUserId,
                CreatedAt = media.CreatedAt,
                Artist = media.Artist,
                Genre = media.Genre,
                Album = media.Album,
                Description = media.Description,
                MediaType = media.MediaType,
                ThumbnailPath = media.ThumbnailPath,
                DurationInSeconds = media.DurationInSeconds,
                FileSizeInBytes = media.FileSizeInBytes
            };
        }
}
