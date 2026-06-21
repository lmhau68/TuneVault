using TuneVault.Domain.Entities;

namespace TuneVault.Application.Interfaces;

public interface IFavoriteRepository
{
    Task AddAsync(Favorite favorite);
    Task RemoveAsync(int userId, int mediaItemId);
    Task<IEnumerable<Favorite>> GetByUserAsync(int userId);
}