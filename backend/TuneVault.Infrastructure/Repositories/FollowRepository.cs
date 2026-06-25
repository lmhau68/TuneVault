using Dapper;
using TuneVault.Application.DTOs;
using TuneVault.Application.Interfaces;

namespace TuneVault.Infrastructure.Repositories;

public class FollowRepository : IFollowRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public FollowRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<bool> ToggleFollowAsync(int followerUserId, int followingUserId)
    {
        using var connection = _connectionFactory.CreateConnection();

        var checkSql = @"
            SELECT COUNT(1) FROM Follows
            WHERE FollowerUserId = @FollowerUserId AND FollowingUserId = @FollowingUserId";

        var exists = await connection.ExecuteScalarAsync<int>(checkSql, new
        {
            FollowerUserId = followerUserId,
            FollowingUserId = followingUserId
        });

        if (exists > 0)
        {
            var deleteSql = @"
                DELETE FROM Follows
                WHERE FollowerUserId = @FollowerUserId AND FollowingUserId = @FollowingUserId";

            await connection.ExecuteAsync(deleteSql, new
            {
                FollowerUserId = followerUserId,
                FollowingUserId = followingUserId
            });
            return false;
        }
        else
        {
            var insertSql = @"
                INSERT INTO Follows (FollowerUserId, FollowingUserId, CreatedAt)
                VALUES (@FollowerUserId, @FollowingUserId, GETDATE())";

            await connection.ExecuteAsync(insertSql, new
            {
                FollowerUserId = followerUserId,
                FollowingUserId = followingUserId
            });
            return true;
        }
    }

    public async Task<bool> IsFollowingAsync(int followerUserId, int followingUserId)
    {
        using var connection = _connectionFactory.CreateConnection();

        var sql = @"
            SELECT COUNT(1) FROM Follows
            WHERE FollowerUserId = @FollowerUserId AND FollowingUserId = @FollowingUserId";

        var count = await connection.ExecuteScalarAsync<int>(sql, new
        {
            FollowerUserId = followerUserId,
            FollowingUserId = followingUserId
        });
        return count > 0;
    }

    public async Task<List<FollowUserResponseDto>> GetFollowingAsync(int userId)
    {
        using var connection = _connectionFactory.CreateConnection();

        var sql = @"
            SELECT
                u.Id            AS UserId,
                u.DisplayName,
                up.AvatarUrl,
                up.Bio,
                f.CreatedAt     AS FollowedAt
            FROM Follows f
            INNER JOIN Users u ON f.FollowingUserId = u.Id
            LEFT JOIN UserProfiles up ON up.UserId = u.Id
            WHERE f.FollowerUserId = @UserId
            ORDER BY f.CreatedAt DESC";

        var result = await connection.QueryAsync<FollowUserResponseDto>(sql, new { UserId = userId });
        return result.ToList();
    }

    public async Task<List<FollowUserResponseDto>> GetFollowersAsync(int userId)
    {
        using var connection = _connectionFactory.CreateConnection();

        var sql = @"
            SELECT
                u.Id            AS UserId,
                u.DisplayName,
                up.AvatarUrl,
                up.Bio,
                f.CreatedAt     AS FollowedAt
            FROM Follows f
            INNER JOIN Users u ON f.FollowerUserId = u.Id
            LEFT JOIN UserProfiles up ON up.UserId = u.Id
            WHERE f.FollowingUserId = @UserId
            ORDER BY f.CreatedAt DESC";

        var result = await connection.QueryAsync<FollowUserResponseDto>(sql, new { UserId = userId });
        return result.ToList();
    }

    // Check user tồn tại — tự xử lý luôn, không cần IUserRepository
    public async Task<bool> UserExistsAsync(int userId)
    {
        using var connection = _connectionFactory.CreateConnection();
        var count = await connection.ExecuteScalarAsync<int>(
            "SELECT COUNT(1) FROM Users WHERE Id = @Id",
            new { Id = userId });
        return count > 0;
    }
}