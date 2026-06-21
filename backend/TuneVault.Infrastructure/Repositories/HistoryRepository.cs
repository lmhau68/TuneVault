using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;

namespace TuneVault.Infrastructure.Repositories;

public class HistoryRepository : IHistoryRepository
{
    public Task AddAsync(PlayHistory history)
    {
        throw new NotImplementedException();
    }

    public Task<IEnumerable<PlayHistory>> GetByUserAsync(int userId)
    {
        throw new NotImplementedException();
    }
}
