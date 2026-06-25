using Dapper;
using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;

namespace TuneVault.Infrastructure.Repositories;

public class PlaylistRepository : IPlaylistRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public PlaylistRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<int> CreateAsync(Playlist playlist)
    {
        using var connection = _connectionFactory.CreateConnection();

        var sql = @"
            INSERT INTO Playlists (UserId, Name, Description, IsPublic, CreatedAt)
            VALUES (@UserId, @Name, @Description, @IsPublic, @CreatedAt);
            SELECT CAST(SCOPE_IDENTITY() AS INT);";

        return await connection.ExecuteScalarAsync<int>(sql, playlist);
    }

    public async Task<Playlist?> GetByIdAsync(int id)
    {
        using var connection = _connectionFactory.CreateConnection();

        var sql = "SELECT * FROM Playlists WHERE Id = @Id";

        return await connection.QueryFirstOrDefaultAsync<Playlist>(
            sql, new { Id = id });
    }

    public async Task<List<Playlist>> GetByUserIdAsync(int userId)
    {
        using var connection = _connectionFactory.CreateConnection();

        var sql = @"
            SELECT * FROM Playlists
            WHERE UserId = @UserId
            ORDER BY CreatedAt DESC";

        var result = await connection.QueryAsync<Playlist>(
            sql, new { UserId = userId });

        return result.ToList();
    }

    public async Task<List<PlaylistTrack>> GetTracksByPlaylistIdAsync(int playlistId)
    {
        using var connection = _connectionFactory.CreateConnection();

        var sql = @"
            SELECT * FROM PlaylistTracks
            WHERE PlaylistId = @PlaylistId
            ORDER BY Position ASC";

        var result = await connection.QueryAsync<PlaylistTrack>(
            sql, new { PlaylistId = playlistId });

        return result.ToList();
    }

    public async Task<bool> TrackExistsAsync(int playlistId, int mediaItemId)
    {
        using var connection = _connectionFactory.CreateConnection();

        var sql = @"
            SELECT COUNT(1) FROM PlaylistTracks
            WHERE PlaylistId = @PlaylistId AND MediaItemId = @MediaItemId";

        var count = await connection.ExecuteScalarAsync<int>(
            sql, new { PlaylistId = playlistId, MediaItemId = mediaItemId });

        return count > 0;
    }

    public async Task AddTrackAsync(PlaylistTrack track)
    {
        using var connection = _connectionFactory.CreateConnection();

        var sql = @"
            INSERT INTO PlaylistTracks (PlaylistId, MediaItemId, Position, AddedAt)
            VALUES (@PlaylistId, @MediaItemId, @Position, @AddedAt)";

        await connection.ExecuteAsync(sql, track);
    }

    public async Task RemoveTrackAsync(int playlistId, int mediaItemId)
    {
        using var connection = _connectionFactory.CreateConnection();

        var sql = @"
            DELETE FROM PlaylistTracks
            WHERE PlaylistId = @PlaylistId AND MediaItemId = @MediaItemId";

        await connection.ExecuteAsync(
            sql, new { PlaylistId = playlistId, MediaItemId = mediaItemId });
    }

    public async Task DeleteAsync(int playlistId)
    {
        using var connection = _connectionFactory.CreateConnection();

        var sql = @"
            DELETE FROM PlaylistTracks WHERE PlaylistId = @PlaylistId;
            DELETE FROM Playlists WHERE Id = @PlaylistId;";

        await connection.ExecuteAsync(sql, new { PlaylistId = playlistId });
    }
    public async Task<List<Playlist>> SearchPublicPlaylistsAsync(string keyword)
    {
        using var connection = _connectionFactory.CreateConnection();
        
        // Chỉ tìm playlist CÔNG KHAI (IsPublic = 1)
        var sql = @"
            SELECT * FROM Playlists 
            WHERE IsPublic = 1 
            AND (Name LIKE @Keyword OR Description LIKE @Keyword)
            ORDER BY CreatedAt DESC";

        var result = await connection.QueryAsync<Playlist>(sql, new { Keyword = $"%{keyword}%" });
        
        return result.ToList();
    }
}