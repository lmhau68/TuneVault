using TuneVault.Application.DTOs.Favorite;

namespace TuneVault.Application.Interfaces;

public interface IFavoriteRepository
{
    // Lấy danh sách media yêu thích của user (có phân trang)
    Task<List<FavoriteMediaResponseDto>> GetUserFavoritesAsync(int userId, int page = 1, int pageSize = 20);

    // Toggle like/unlike — trả về true nếu vừa like, false nếu vừa unlike
    Task<bool> ToggleFavoriteAsync(int userId, int mediaItemId);

    // Kiểm tra user đã like bài này chưa
    Task<bool> IsFavoritedAsync(int userId, int mediaItemId);

    // Lấy danh sách ca sĩ user yêu thích gần đây nhất (dùng cho AI recommendation)
    Task<List<string>> GetFavoriteArtistsAsync(int userId, int limit = 5);
}

