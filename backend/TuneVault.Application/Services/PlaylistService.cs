using TuneVault.Application.DTOs.Playlists;
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

    public async Task<int> CreateAsync(int userId, CreatePlaylistRequest request)
    {
        var playlist = new Playlist
        {
            UserId = userId,
            Name = request.Name,
            Description = request.Description,
            IsPublic = request.IsPublic,
            CreatedAt = DateTime.UtcNow
        };

        return await _playlistRepository.CreateAsync(playlist);
    }

    public async Task<PlaylistResponse?> GetByIdAsync(int id)
    {
        var playlist = await _playlistRepository.GetByIdAsync(id);
        if (playlist == null) return null;

        var tracks = await _playlistRepository.GetTracksByPlaylistIdAsync(id);

        return MapToResponse(playlist, tracks);
    }

    public async Task<List<PlaylistResponse>> GetByUserIdAsync(int userId)
    {
        var playlists = await _playlistRepository.GetByUserIdAsync(userId);

        var result = new List<PlaylistResponse>();
        foreach (var playlist in playlists)
        {
            var tracks = await _playlistRepository.GetTracksByPlaylistIdAsync(playlist.Id);
            result.Add(MapToResponse(playlist, tracks));
        }

        return result;
    }

    public async Task<(bool Success, string Message)> AddTrackAsync(
        int playlistId, int requestUserId, AddTrackRequest request)
    {
        var playlist = await _playlistRepository.GetByIdAsync(playlistId);
        if (playlist == null)
            return (false, "Không tìm thấy playlist.");

        if (playlist.UserId != requestUserId)
            return (false, "Bạn không có quyền chỉnh sửa playlist này.");

        var alreadyExists = await _playlistRepository
            .TrackExistsAsync(playlistId, request.MediaItemId);
        if (alreadyExists)
            return (false, "Bài hát đã có trong playlist.");

        var track = new PlaylistTrack
        {
            PlaylistId = playlistId,
            MediaItemId = request.MediaItemId,
            Position = request.Position,
            AddedAt = DateTime.UtcNow
        };

        await _playlistRepository.AddTrackAsync(track);
        return (true, "Thêm bài hát vào playlist thành công.");
    }

    public async Task<(bool Success, string Message)> RemoveTrackAsync(
        int playlistId, int mediaItemId, int requestUserId)
    {
        var playlist = await _playlistRepository.GetByIdAsync(playlistId);
        if (playlist == null)
            return (false, "Không tìm thấy playlist.");

        if (playlist.UserId != requestUserId)
            return (false, "Bạn không có quyền chỉnh sửa playlist này.");

        await _playlistRepository.RemoveTrackAsync(playlistId, mediaItemId);
        return (true, "Đã xóa bài hát khỏi playlist.");
    }

    public async Task<(bool Success, string Message)> DeleteAsync(
        int playlistId, int requestUserId)
    {
        var playlist = await _playlistRepository.GetByIdAsync(playlistId);
        if (playlist == null)
            return (false, "Không tìm thấy playlist.");

        if (playlist.UserId != requestUserId)
            return (false, "Bạn không có quyền xóa playlist này.");

        await _playlistRepository.DeleteAsync(playlistId);
        return (true, "Xóa playlist thành công.");
    }
    public async Task<IEnumerable<PlaylistResponse>> SearchPlaylistsAsync(string keyword, int userId)
    {
        // 1. Gọi Repo truyền cả từ khóa lẫn ID người dùng vào
        var playlists = await _playlistRepository.SearchPlaylistsAsync(keyword, userId);
        
        // 2. Map từ Entity sang DTO để trả về cho Frontend
        return playlists.Select(p => new PlaylistResponse 
        {
            Id = p.Id,
            Name = p.Name,
            Description = p.Description,
            IsPublic = p.IsPublic,
            UserId = p.UserId
        }).ToList();
    }
    // -----------------------------------------------
    // Private helper
    // -----------------------------------------------
    private static PlaylistResponse MapToResponse(
        Playlist playlist, List<PlaylistTrack> tracks) => new()
        {
            Id = playlist.Id,
            Name = playlist.Name,
            Description = playlist.Description,
            CoverImagePath = playlist.CoverImagePath,
            IsPublic = playlist.IsPublic,
            UserId = playlist.UserId,
            CreatedAt = playlist.CreatedAt,
            UpdatedAt = playlist.UpdatedAt,
            Tracks = tracks.Select(t => new PlaylistTrackResponse
            {
                MediaItemId = t.MediaItemId,
                Position = t.Position,
                AddedAt = t.AddedAt
            }).ToList()
        };
}