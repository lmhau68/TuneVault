using TuneVault.Application.Interfaces;
using Dapper;
namespace TuneVault.Infrastructure.Repositories;

public class HistoryRepository : IHistoryRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public HistoryRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<List<string>> GetRecentGenresAsync(int userId, int limit = 5)
    {
        using var connection = _connectionFactory.CreateConnection();
        
        // Lấy top thể loại nghe gần nhất, gom nhóm lại để không bị trùng
        var sql = @"
            SELECT TOP (@Limit) m.Genre
            FROM PlayHistories ph
            INNER JOIN MediaItems m ON ph.MediaItemId = m.Id
            WHERE ph.UserId = @UserId AND m.Genre IS NOT NULL
            GROUP BY m.Genre
            ORDER BY MAX(ph.PlayedAt) DESC";

        var genres = await connection.QueryAsync<string>(sql, new { UserId = userId, Limit = limit });
        return genres.ToList();
    }
}
