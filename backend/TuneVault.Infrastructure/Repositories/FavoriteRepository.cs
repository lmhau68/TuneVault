using Dapper;
using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;

namespace TuneVault.Infrastructure.Repositories;

public class FavoriteRepository : IFavoriteRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public FavoriteRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task AddAsync(Favorite favorite)
    {
        using var connection = _connectionFactory.CreateConnection();

        var sql = @"
            INSERT INTO Favorites
            (
                UserId,
                MediaItemId,
                CreatedAt
            )
            VALUES
            (
                @UserId,
                @MediaItemId,
                @CreatedAt
            )";

        await connection.ExecuteAsync(sql, favorite);
    }

    public async Task RemoveAsync(int userId, int mediaItemId)
    {
        using var connection = _connectionFactory.CreateConnection();

        var sql = @"
            DELETE FROM Favorites
            WHERE UserId = @UserId
            AND MediaItemId = @MediaItemId";

        await connection.ExecuteAsync(sql, new
        {
            UserId = userId,
            MediaItemId = mediaItemId
        });
    }

    public async Task<IEnumerable<Favorite>> GetByUserAsync(int userId)
    {
        using var connection = _connectionFactory.CreateConnection();

        var sql = @"
            SELECT *
            FROM Favorites
            WHERE UserId = @UserId
            ORDER BY CreatedAt DESC";

        return await connection.QueryAsync<Favorite>(sql, new
        {
            UserId = userId
        });
    }
}