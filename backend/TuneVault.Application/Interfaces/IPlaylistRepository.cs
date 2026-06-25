using TuneVault.Domain.Entities;

namespace TuneVault.Application.Interfaces;

public interface IPlaylistRepository
{
    Task<int> CreateAsync(Playlist playlist);
    Task<Playlist?> GetByIdAsync(int id);
    Task<List<Playlist>> GetByUserIdAsync(int userId);
    Task<List<PlaylistTrack>> GetTracksByPlaylistIdAsync(int playlistId);
    Task<bool> TrackExistsAsync(int playlistId, int mediaItemId);
    Task AddTrackAsync(PlaylistTrack track);
    Task RemoveTrackAsync(int playlistId, int mediaItemId);
    Task DeleteAsync(int playlistId);
    // Tìm kiếm playlist
    Task<List<Playlist>> SearchPlaylistsAsync(string keyword, int currentUserId);
}