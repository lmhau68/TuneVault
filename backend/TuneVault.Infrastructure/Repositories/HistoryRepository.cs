using Dapper;
using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;

namespace TuneVault.Infrastructure.Repositories;

public class HistoryRepository : IHistoryRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public HistoryRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task AddAsync(PlayHistory history)
    {
        using var connection = _connectionFactory.CreateConnection();

        var sql = @"
            INSERT INTO PlayHistories
            (
                UserId,
                MediaItemId,
                PlayedAt,
                ProgressInSeconds
            )
            VALUES
            (
                @UserId,
                @MediaItemId,
                @PlayedAt,
                @ProgressInSeconds
            )";

        await connection.ExecuteAsync(sql, history);
    }

    public async Task<IEnumerable<PlayHistory>> GetByUserAsync(int userId)
    {
        using var connection = _connectionFactory.CreateConnection();

        var sql = @"
            SELECT *
            FROM PlayHistories
            WHERE UserId = @UserId
            ORDER BY PlayedAt DESC";

        return await connection.QueryAsync<PlayHistory>(
            sql,
            new { UserId = userId }
        );
    }
}