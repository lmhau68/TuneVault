using TuneVault.Domain.Entities;

namespace TuneVault.Application.Interfaces;

public interface IHistoryRepository
{
    Task AddAsync(PlayHistory history);
    Task<IEnumerable<PlayHistory>> GetByUserAsync(int userId);
}
