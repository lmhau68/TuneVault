using TuneVault.Domain.Entities;

namespace TuneVault.Application.Interfaces;

public interface IMediaRepository
{
    // Các hàm cơ bản của ông B
    Task<int> CreateAsync(MediaItem media);
    Task<IEnumerable<MediaItem>> GetAllAsync();
    Task<MediaItem?> GetByIdAsync(int id);
    Task<IEnumerable<MediaItem>> SearchAsync(string keyword);

    // Các hàm dành cho AI của Tech Lead
    Task<List<MediaItem>> GetItemsByTitlesAsync(List<string> titles);
    Task<List<string>> GetRandomAvailableTitlesAsync(int limit = 50);
}