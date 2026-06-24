using TuneVault.Application.Interfaces;
using Dapper;
namespace TuneVault.Infrastructure.Repositories;

public class FavoriteRepository : IFavoriteRepository
{
private readonly IDbConnectionFactory _connectionFactory;

    public FavoriteRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<List<string>> GetFavoriteArtistsAsync(int userId, int limit = 5)
    {
        using var connection = _connectionFactory.CreateConnection();
        
        // Lấy top ca sĩ user vừa thả tim, gom nhóm không để trùng
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
