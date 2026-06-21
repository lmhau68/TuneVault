using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;

namespace TuneVault.Infrastructure.Repositories;

public class PlaylistRepository : IPlaylistRepository
{
    public Task<int> CreateAsync(Playlist playlist)
    {
        throw new NotImplementedException();
    }

    public Task<Playlist?> GetByIdAsync(int id)
    {
        throw new NotImplementedException();
    }

    public Task AddTrackAsync(PlaylistTrack track)
    {
        throw new NotImplementedException();
    }

    public Task RemoveTrackAsync(int playlistId, int mediaItemId)
    {
        throw new NotImplementedException();
    }
}