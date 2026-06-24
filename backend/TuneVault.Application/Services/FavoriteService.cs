using TuneVault.Application.DTOs;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Services;

public class FavoriteService
{
    private readonly IFavoriteRepository _favoriteRepository;
    private readonly IMediaRepository _mediaRepository;

    public FavoriteService(IFavoriteRepository favoriteRepository, IMediaRepository mediaRepository)
    {
        _favoriteRepository = favoriteRepository;
        _mediaRepository = mediaRepository;
    }

    // Lấy danh sách media yêu thích của user
    public async Task<List<FavoriteMediaResponseDto>> GetMyFavoritesAsync(int userId, int page, int pageSize)
    {
        return await _favoriteRepository.GetUserFavoritesAsync(userId, page, pageSize);
    }

    // Toggle like/unlike với validation media có tồn tại không
    public async Task<ToggleFavoriteResponseDto> ToggleFavoriteAsync(int userId, int mediaItemId)
    {
        // Kiểm tra media có tồn tại không trước khi like
        var mediaExists = await _mediaRepository.ExistsAsync(mediaItemId);
        if (!mediaExists)
            throw new KeyNotFoundException($"Không tìm thấy media với Id = {mediaItemId}.");

        var isNowFavorited = await _favoriteRepository.ToggleFavoriteAsync(userId, mediaItemId);

        return new ToggleFavoriteResponseDto
        {
            IsFavorited = isNowFavorited,
            Message = isNowFavorited ? "Đã thêm vào yêu thích." : "Đã xóa khỏi yêu thích."
        };
    }

    // Kiểm tra trạng thái like của 1 bài
    public async Task<FavoriteStatusDto> GetFavoriteStatusAsync(int userId, int mediaItemId)
    {
        var isFavorited = await _favoriteRepository.IsFavoritedAsync(userId, mediaItemId);
        return new FavoriteStatusDto
        {
            MediaItemId = mediaItemId,
            IsFavorited = isFavorited
        };
    }
}