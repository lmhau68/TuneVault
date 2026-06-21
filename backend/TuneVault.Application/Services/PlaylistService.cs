using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Services;

public class PlaylistService
{
    private readonly IPlaylistRepository _playlistRepository;

    public PlaylistService(IPlaylistRepository playlistRepository)
    {
        _playlistRepository = playlistRepository;
    }

    public async Task<int> CreatePlaylistAsync(Playlist playlist)
    {
        return await _playlistRepository.CreateAsync(playlist);
    }

    public async Task<Playlist?> GetPlaylistByIdAsync(int id)
    {
        return await _playlistRepository.GetByIdAsync(id);
    }

    public async Task AddTrackAsync(PlaylistTrack track)
    {
        await _playlistRepository.AddTrackAsync(track);
    }

    public async Task RemoveTrackAsync(int playlistId, int mediaItemId)
    {
        await _playlistRepository.RemoveTrackAsync(playlistId, mediaItemId);
    }
}