using TuneVault.Domain.Entities;

namespace TuneVault.Application.Interfaces;

public interface IMediaRepository
{
    // Các hàm cơ bản
    Task<int> CreateAsync(MediaItem media);
    Task<IEnumerable<MediaItem>> GetAllAsync();
    Task<MediaItem?> GetByIdAsync(int id);
    Task<IEnumerable<MediaItem>> SearchAsync(string keyword);
    Task<IEnumerable<MediaItem>> SearchMyMediaAsync(string keyword, int currentUserId);
    Task<List<MediaItem>> GetItemsByTitlesAsync(List<string> titles);
    Task<List<string>> GetRandomAvailableTitlesAsync(int limit = 50);

    // Check media tồn tại (dùng cho Favorite, History)
    Task<bool> ExistsAsync(int mediaItemId);
}