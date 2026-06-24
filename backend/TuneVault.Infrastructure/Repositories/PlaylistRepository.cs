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
            INSERT INTO Playlists
            (
                UserId,
                Name,
                Description,
                CoverImagePath,
                IsPublic,
                CreatedAt,
                UpdatedAt
            )
            VALUES
            (
                @UserId,
                @Name,
                @Description,
                @CoverImagePath,
                @IsPublic,
                @CreatedAt,
                @UpdatedAt
            );

            SELECT CAST(SCOPE_IDENTITY() as int);";

        return await connection.ExecuteScalarAsync<int>(sql, playlist);
    }

    public async Task<Playlist?> GetByIdAsync(int id)
    {
        using var connection = _connectionFactory.CreateConnection();

        var sql = @"
            SELECT *
            FROM Playlists
            WHERE Id = @Id";

        return await connection.QueryFirstOrDefaultAsync<Playlist>(
            sql,
            new { Id = id }
        );
    }

    public async Task AddTrackAsync(PlaylistTrack track)
    {
        using var connection = _connectionFactory.CreateConnection();

        var sql = @"
            INSERT INTO PlaylistTracks
            (
                PlaylistId,
                MediaItemId,
                Position,
                AddedAt
            )
            VALUES
            (
                @PlaylistId,
                @MediaItemId,
                @Position,
                @AddedAt
            )";

        await connection.ExecuteAsync(sql, track);
    }

    public async Task RemoveTrackAsync(int playlistId, int mediaItemId)
    {
        using var connection = _connectionFactory.CreateConnection();

        var sql = @"
            DELETE FROM PlaylistTracks
            WHERE PlaylistId = @PlaylistId
            AND MediaItemId = @MediaItemId";

        await connection.ExecuteAsync(sql, new
        {
            PlaylistId = playlistId,
            MediaItemId = mediaItemId
        });
    }
}