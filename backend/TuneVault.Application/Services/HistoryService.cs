using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Services;

public class HistoryService
{
    private readonly IHistoryRepository _historyRepository;

    public HistoryService(IHistoryRepository historyRepository)
    {
        _historyRepository = historyRepository;
    }

    public async Task AddHistoryAsync(PlayHistory history)
    {
        await _historyRepository.AddAsync(history);
    }

    public async Task<IEnumerable<PlayHistory>> GetHistoryByUserAsync(int userId)
    {
        return await _historyRepository.GetByUserAsync(userId);
    }
}