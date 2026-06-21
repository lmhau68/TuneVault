using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Services;

public class FavoriteService
{
    private readonly IFavoriteRepository _favoriteRepository;

    public FavoriteService(IFavoriteRepository favoriteRepository)
    {
        _favoriteRepository = favoriteRepository;
    }

    public async Task AddFavoriteAsync(Favorite favorite)
    {
        await _favoriteRepository.AddAsync(favorite);
    }

    public async Task RemoveFavoriteAsync(int userId, int mediaItemId)
    {
        await _favoriteRepository.RemoveAsync(userId, mediaItemId);
    }

    public async Task<IEnumerable<Favorite>> GetFavoritesByUserAsync(int userId)
    {
        return await _favoriteRepository.GetByUserAsync(userId);
    }
}
