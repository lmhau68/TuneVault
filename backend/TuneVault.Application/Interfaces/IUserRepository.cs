using System.Data;
using Dapper;
using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;

namespace TuneVault.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    // Tiêm IDbConnectionFactory thông qua Dependency Injection
    public UserRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<User?> GetUserByUsernameAsync(string username)
    {
        const string sql = @"
            SELECT Id, Username, PasswordHash, Email, CreatedAt 
            FROM Users 
            WHERE Username = @Username";

        // Dùng 'using' để đảm bảo connection tự động đóng (Dispose) sau khi thực thi xong
        using var connection = _connectionFactory.CreateConnection();
        
        return await connection.QuerySingleOrDefaultAsync<User>(sql, new { Username = username });
    }

    public async Task<User?> GetUserByIdAsync(int id)
    {
        // Sử dụng LEFT JOIN để lấy User kèm theo UserProfile (nếu có)
        const string sql = @"
            SELECT 
                u.Id, u.Username, u.PasswordHash, u.Email, u.CreatedAt,
                p.Id, p.UserId, p.DisplayName, p.AvatarUrl, p.Bio, p.UpdatedAt
            FROM Users u
            LEFT JOIN UserProfiles p ON u.Id = p.UserId
            WHERE u.Id = @Id";

        using var connection = _connectionFactory.CreateConnection();

        // Kỹ thuật Multi-Mapping của Dapper: Map 2 bảng vào 1 object User
        var result = await connection.QueryAsync<User, UserProfile, User>(
            sql,
            (user, profile) =>
            {
                user.Profile = profile; // Gắn profile vào thuộc tính navigation của User
                return user;
            },
            new { Id = id },
            splitOn: "Id" // Dapper sẽ tự tách dữ liệu Profile bắt đầu từ cột 'Id' thứ 2
        );

        return result.FirstOrDefault();
    }

    public async Task<bool> CreateUserAsync(User user)
    {
        const string sql = @"
            INSERT INTO Users (Username, PasswordHash, Email, CreatedAt) 
            VALUES (@Username, @PasswordHash, @Email, @CreatedAt)";

        using var connection = _connectionFactory.CreateConnection();
        
        // ExecuteAsync trả về số dòng bị ảnh hưởng
        var rowsAffected = await connection.ExecuteAsync(sql, user);
        return rowsAffected > 0;
    }

    public async Task<bool> UpdateUserProfileAsync(UserProfile profile)
    {
        // Logic UPSERT: Cập nhật nếu đã tồn tại, Tạo mới nếu chưa có
        const string sql = @"
            IF EXISTS (SELECT 1 FROM UserProfiles WHERE UserId = @UserId)
            BEGIN
                UPDATE UserProfiles 
                SET DisplayName = @DisplayName, 
                    AvatarUrl = @AvatarUrl, 
                    Bio = @Bio, 
                    UpdatedAt = @UpdatedAt
                WHERE UserId = @UserId
            END
            ELSE
            BEGIN
                INSERT INTO UserProfiles (UserId, DisplayName, AvatarUrl, Bio, UpdatedAt)
                VALUES (@UserId, @DisplayName, @AvatarUrl, @Bio, @UpdatedAt)
            END";

        using var connection = _connectionFactory.CreateConnection();
        
        var rowsAffected = await connection.ExecuteAsync(sql, profile);
        return rowsAffected > 0;
    }
}