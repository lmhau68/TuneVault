using System.Collections.Generic;
using System.Threading.Tasks;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Interfaces;

public interface IMediaRepository
{
    // TODO: Khai bao cac method cho MediaRepository
    Task<int> CreateAsync(MediaItem media);
        Task<IEnumerable<MediaItem>> GetAllAsync();
        Task<MediaItem?> GetByIdAsync(int id);
        Task<IEnumerable<MediaItem>> SearchAsync(string keyword);
}
