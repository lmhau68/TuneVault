using Dapper;
using TuneVault.Application.DTOs;
using TuneVault.Application.Interfaces;

namespace TuneVault.Infrastructure.Repositories;

public class FavoriteRepository : IFavoriteRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public FavoriteRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    // Lấy danh sách media yêu thích, JOIN với MediaItems để có đủ thông tin hiển thị
    public async Task<List<FavoriteMediaResponseDto>> GetUserFavoritesAsync(int userId, int page = 1, int pageSize = 20)
    {
        using var connection = _connectionFactory.CreateConnection();

        var sql = @"
            SELECT
                f.Id            AS FavoriteId,
                m.Id            AS MediaItemId,
                m.Title,
                m.Artist,
                m.Album,
                m.Genre,
                m.MediaType,
                m.ThumbnailPath,
                m.DurationInSeconds,
                f.CreatedAt
            FROM Favorites f
            INNER JOIN MediaItems m ON f.MediaItemId = m.Id
            WHERE f.UserId = @UserId
            ORDER BY f.CreatedAt DESC
            OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY";

        var result = await connection.QueryAsync<FavoriteMediaResponseDto>(sql, new
        {
            UserId = userId,
            Offset = (page - 1) * pageSize,
            PageSize = pageSize
        });

        return result.ToList();
    }

    // Toggle: nếu chưa like thì INSERT, nếu đã like thì DELETE
    // Trả về true = vừa like, false = vừa unlike
    public async Task<bool> ToggleFavoriteAsync(int userId, int mediaItemId)
    {
        using var connection = _connectionFactory.CreateConnection();

        // Kiểm tra đã tồn tại chưa
        var checkSql = @"
            SELECT COUNT(1) FROM Favorites
            WHERE UserId = @UserId AND MediaItemId = @MediaItemId";

        var exists = await connection.ExecuteScalarAsync<int>(checkSql, new { UserId = userId, MediaItemId = mediaItemId });

        if (exists > 0)
        {
            // Đã like → unlike (xóa đi)
            var deleteSql = @"
                DELETE FROM Favorites
                WHERE UserId = @UserId AND MediaItemId = @MediaItemId";

            await connection.ExecuteAsync(deleteSql, new { UserId = userId, MediaItemId = mediaItemId });
            return false;
        }
        else
        {
            // Chưa like → like (thêm vào)
            var insertSql = @"
                INSERT INTO Favorites (UserId, MediaItemId, CreatedAt)
                VALUES (@UserId, @MediaItemId, GETDATE())";

            await connection.ExecuteAsync(insertSql, new { UserId = userId, MediaItemId = mediaItemId });
            return true;
        }
    }

    // Kiểm tra trạng thái like của 1 bài cụ thể
    public async Task<bool> IsFavoritedAsync(int userId, int mediaItemId)
    {
        using var connection = _connectionFactory.CreateConnection();

        var sql = @"
            SELECT COUNT(1) FROM Favorites
            WHERE UserId = @UserId AND MediaItemId = @MediaItemId";

        var count = await connection.ExecuteScalarAsync<int>(sql, new { UserId = userId, MediaItemId = mediaItemId });
        return count > 0;
    }

    // Lấy top ca sĩ user hay like nhất (dùng cho AI recommendation)
    public async Task<List<string>> GetFavoriteArtistsAsync(int userId, int limit = 5)
    {
        using var connection = _connectionFactory.CreateConnection();
        var sql = @"
            SELECT TOP (@Limit) m.Artist
            FROM Favorites f
            INNER JOIN MediaItems m ON f.MediaItemId = m.Id
            WHERE f.UserId = @UserId AND m.Artist IS NOT NULL
            GROUP BY m.Artist
            ORDER BY MAX(f.CreatedAt) DESC";

        var artists = await connection.QueryAsync<string>(sql, new { UserId = userId, Limit = limit });
        return artists.ToList();
    }
}

