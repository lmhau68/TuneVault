using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;

namespace TuneVault.Infrastructure.Repositories;

public class FavoriteRepository : IFavoriteRepository
{
    public Task AddAsync(Favorite favorite)
    {
        throw new NotImplementedException();
    }

    public Task RemoveAsync(int userId, int mediaItemId)
    {
        throw new NotImplementedException();
    }

    public Task<IEnumerable<Favorite>> GetByUserAsync(int userId)
    {
        throw new NotImplementedException();
    }
}