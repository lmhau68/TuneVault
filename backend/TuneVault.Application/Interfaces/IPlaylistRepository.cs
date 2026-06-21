using TuneVault.Domain.Entities;

namespace TuneVault.Application.Interfaces;

public interface IPlaylistRepository
{
    Task<int> CreateAsync(Playlist playlist);

    Task<Playlist?> GetByIdAsync(int id);

    Task AddTrackAsync(PlaylistTrack track);

    Task RemoveTrackAsync(int playlistId, int mediaItemId);
}