using System.Data;
using Dapper;
using TuneVault.Domain.Entities;
using TuneVault.Application.Interfaces;

namespace TuneVault.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    // Sử dụng Dependency Injection
    public UserRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<User?> GetByIdAsync(int id)
    {
        // Viết câu lệnh SQL kết hợp (JOIN) Users và UserProfiles
        // Dùng alias 'ProfileId' để Dapper biết điểm cắt (splitOn) giữa 2 bảng
        const string sql = @"
            SELECT 
                u.Id, u.Email, u.PasswordHash, u.DisplayName, u.CreatedAt, u.UpdatedAt,
                p.Id AS ProfileId, p.UserId, p.FullName, p.Bio, p.AvatarUrl, p.CreatedAt, p.UpdatedAt
            FROM Users u
            LEFT JOIN UserProfiles p ON u.Id = p.UserId
            WHERE u.Id = @Id";

        using var connection = _connectionFactory.CreateConnection();
        
        // Multi-mapping: Ánh xạ dòng SQL thành 2 đối tượng User và UserProfile
        var users = await connection.QueryAsync<User, UserProfile, User>(
            sql,
            (user, profile) =>
            {
                user.Profile = profile; // Gắn profile vào user
                return user;
            },
            new { Id = id },
            splitOn: "ProfileId"
        );

        return users.FirstOrDefault();
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        const string sql = @"
            SELECT Id, Email, PasswordHash, DisplayName, CreatedAt, UpdatedAt 
            FROM Users 
            WHERE Email = @Email";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<User>(sql, new { Email = email });
    }

    public async Task<int> CreateAsync(User user)
    {
        // Dùng OUTPUT INSERTED.Id để lấy Id vừa được tự động sinh ra
        const string sql = @"
            INSERT INTO Users (Email, PasswordHash, DisplayName, CreatedAt)
            OUTPUT INSERTED.Id
            VALUES (@Email, @PasswordHash, @DisplayName, GETDATE())";

        using var connection = _connectionFactory.CreateConnection();
        var newUserId = await connection.ExecuteScalarAsync<int>(sql, user);
        
        return newUserId;
    }

    public async Task<bool> UpdateProfileAsync(int userId, UserProfile profile)
    {
        // Xử lý logic Upsert (Update nếu đã có, Insert nếu chưa có) 
        // dựa đúng vào cấu trúc 2 bảng của Database
        const string sql = @"
            IF EXISTS (SELECT 1 FROM UserProfiles WHERE UserId = @UserId)
            BEGIN
                UPDATE UserProfiles
                SET FullName = @FullName, 
                    Bio = @Bio, 
                    AvatarUrl = @AvatarUrl, 
                    UpdatedAt = GETDATE()
                WHERE UserId = @UserId
            END
            ELSE
            BEGIN
                INSERT INTO UserProfiles (UserId, FullName, Bio, AvatarUrl, CreatedAt)
                VALUES (@UserId, @FullName, @Bio, @AvatarUrl, GETDATE())
            END";

        var parameters = new 
        { 
            UserId = userId, 
            FullName = profile.FullName, 
            Bio = profile.Bio, 
            AvatarUrl = profile.AvatarUrl 
        };

        using var connection = _connectionFactory.CreateConnection();
        var rowsAffected = await connection.ExecuteAsync(sql, parameters);
        
        return rowsAffected > 0;
    }

    public async Task<IEnumerable<User>> GetAllUsersAsync()
    {
        const string sql = @"
            SELECT Id, Email, DisplayName, CreatedAt, UpdatedAt 
            FROM Users 
            ORDER BY CreatedAt DESC";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<User>(sql);
    }
}