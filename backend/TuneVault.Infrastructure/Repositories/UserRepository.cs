using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Dapper;
using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;

namespace TuneVault.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    // Tiêm IDbConnectionFactory qua Constructor để khởi tạo kết nối Database linh hoạt
    public UserRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<User?> GetByIdAsync(int id)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = "SELECT * FROM Users WHERE Id = @Id;";
        
        // Sử dụng QueryFirstOrDefaultAsync của Dapper để lấy bản ghi đầu tiên hoặc null
        return await connection.QueryFirstOrDefaultAsync<User>(sql, new { Id = id });
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = "SELECT * FROM Users WHERE Email = @Email;";
        
        return await connection.QueryFirstOrDefaultAsync<User>(sql, new { Email = email });
    }

    public async Task<int> CreateAsync(User user)
    {
        using var connection = _connectionFactory.CreateConnection();
        
        // Sử dụng SCOPE_IDENTITY() để lấy Id tự tăng (IDENTITY) ngay sau khi Insert thành công
        const string sql = @"
            INSERT INTO Users (Email, PasswordHash, DisplayName, CreatedAt, UpdatedAt)
            VALUES (@Email, @PasswordHash, @DisplayName, @CreatedAt, @UpdatedAt);
            SELECT CAST(SCOPE_IDENTITY() as int);";

        var id = await connection.ExecuteScalarAsync<int>(sql, user);
        return id;
    }

    public async Task<bool> UpdateAsync(User user)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = @"
            UPDATE Users 
            SET Email = @Email, 
                PasswordHash = @PasswordHash, 
                DisplayName = @DisplayName, 
                UpdatedAt = @UpdatedAt 
            WHERE Id = @Id;";

        // ExecuteAsync trả về số hàng (rows) bị ảnh hưởng bởi câu lệnh SQL
        var rowsAffected = await connection.ExecuteAsync(sql, user);
        return rowsAffected > 0;
    }

    public async Task<IEnumerable<User>> SearchByDisplayNameAsync(string query)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = "SELECT * FROM Users WHERE DisplayName LIKE @SearchQuery;";

        // Thêm ký tự wildcard '%' để thực hiện tìm kiếm dạng Full-text/Phần tử chứa cụm từ
        var users = await connection.QueryAsync<User>(sql, new { SearchQuery = $"%{query}%" });
        return users;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        using var connection = _connectionFactory.CreateConnection();
        const string sql = "DELETE FROM Users WHERE Id = @Id;";

        // Nhờ ràng buộc ON DELETE CASCADE trong Schema, khi xóa User, bản ghi UserProfiles tương ứng sẽ tự động bị xóa sạch.
        var rowsAffected = await connection.ExecuteAsync(sql, new { Id = id });
        return rowsAffected > 0;
    }
}