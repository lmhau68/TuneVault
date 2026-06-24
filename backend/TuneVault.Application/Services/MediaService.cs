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
            // 1. Logic lưu file local
            var uploadPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads");
            if (!Directory.Exists(uploadPath)) Directory.CreateDirectory(uploadPath);

            var fileName = $"{Guid.NewGuid()}_{request.File.FileName}";
            var filePath = Path.Combine(uploadPath, fileName);


            // 2. Logic lưu metadata vào DB
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
                throw new ArgumentException("Only mp3, wav, mp4, avi, mov files are allowed.");
            }

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await request.File.CopyToAsync(stream);
            }

            string mediaType =
                extension == ".mp4" ||
                extension == ".avi" ||
                extension == ".mov"
                    ? "Video"
                    : "Audio";

            var media = new MediaItem
            {
                Title = request.Title,

                OwnerUserId = userId,

                Artist = request.Artist,
                Genre = request.Genre,
                Album = request.Album,

                MediaType = mediaType,

                FilePath = $"/uploads/{fileName}",

                FileSizeInBytes = request.File.Length
            };

            var newId = await _mediaRepository.CreateAsync(media);
            media.Id = newId;
            
            // --- DÙNG TRY-CATCH BỌC LẠI ĐỂ BẢO VỆ LUỒNG CHÍNH ---
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
                // Chỉ ghi log lỗi ra Console/File
                Console.WriteLine($"[CẢNH BÁO] Lỗi bắn thông báo SignalR cho user {userId}: {ex.Message}");
            }

            // 3. Trả về Response
            return new MediaResponse
            {
                Id = media.Id,
                Title = media.Title,
                FilePath = media.FilePath,
                OwnerUserId = media.OwnerUserId,
                CreatedAt = DateTime.Now,
                Artist = media.Artist,
                Genre = media.Genre
            };
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
                Genre = media.Genre
            };
        }
}
