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
            var allowedExtensions = new[] { ".mp3", ".wav", ".mp4", ".avi", ".mov" };

            if (!allowedExtensions.Contains(extension))
            {
                throw new ArgumentException("Only mp3, wav, mp4, avi, mov files are allowed.");
            }

            string mediaType = (extension == ".mp4" || extension == ".avi" || extension == ".mov") 
                                ? "Video" 
                                : "Audio";

            // 2. Tạo đường dẫn động theo loại Media
            string subFolder = mediaType.ToLower(); 
            var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", subFolder);
            if (!Directory.Exists(uploadPath)) Directory.CreateDirectory(uploadPath);

            var fileName = $"{Guid.NewGuid()}_{request.File.FileName}";
            var filePath = Path.Combine(uploadPath, fileName);

            // 3. Copy file media
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await request.File.CopyToAsync(stream);
            }

            // 4. XỬ LÝ THUMBNAIL TẠI ĐÂY
            string? thumbnailPath = null;
            if (request.Thumbnail != null && request.Thumbnail.Length > 0)
            {
                var thumbExtension = Path.GetExtension(request.Thumbnail.FileName).ToLowerInvariant();
                var allowedThumbExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };
                
                if (allowedThumbExtensions.Contains(thumbExtension))
                {
                    var thumbFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "thumbnails");
                    if (!Directory.Exists(thumbFolder)) Directory.CreateDirectory(thumbFolder);

                    var thumbName = $"{Guid.NewGuid()}_{request.Thumbnail.FileName}";
                    var thumbFullPath = Path.Combine(thumbFolder, thumbName);

                    using (var stream = new FileStream(thumbFullPath, FileMode.Create))
                    {
                        await request.Thumbnail.CopyToAsync(stream);
                    }
                    thumbnailPath = $"/uploads/thumbnails/{thumbName}"; // Đường dẫn lưu vào DB
                }
            }


            // 5. Lưu thông tin vào Database
            var media = new MediaItem
            {
                Title = request.Title,
                OwnerUserId = userId,
                Artist = request.Artist,
                Genre = request.Genre,
                Album = request.Album,
                Description = request.Description, 
                MediaType = mediaType,
                FilePath = $"/uploads/{subFolder}/{fileName}", 
                ThumbnailPath = thumbnailPath,     
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
