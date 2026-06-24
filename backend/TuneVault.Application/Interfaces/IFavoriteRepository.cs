namespace TuneVault.Application.Interfaces;

public interface IFavoriteRepository
{
    // Lấy danh sách ca sĩ user yêu thích gần đây nhất
    Task<List<string>> GetFavoriteArtistsAsync(int userId, int limit = 5);
}
