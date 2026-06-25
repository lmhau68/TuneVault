using Dapper;
using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;

namespace TuneVault.Infrastructure.Repositories;

public class MediaRepository : IMediaRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    // Dùng Dependency Injection để gọi Connection Factory 
    public MediaRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    // Module mediarepo
    public async Task<int> CreateAsync(MediaItem media)
    {
        var query = @"
            INSERT INTO MediaItems
            (OwnerUserId, Title, Artist, Genre, Album, Description, MediaType, FilePath, ThumbnailPath, DurationInSeconds, FileSizeInBytes, CreatedAt)
            VALUES
            (@OwnerUserId, @Title, @Artist, @Genre, @Album, @Description, @MediaType, @FilePath, @ThumbnailPath, @DurationInSeconds, @FileSizeInBytes, GETDATE());
            SELECT CAST(SCOPE_IDENTITY() as int);";

        using var connection = _connectionFactory.CreateConnection();
        return await connection.QuerySingleAsync<int>(query, media);
    }

    public async Task<IEnumerable<MediaItem>> GetAllAsync()
    {
        var query = "SELECT * FROM MediaItems ORDER BY CreatedAt DESC";
        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<MediaItem>(query);
    }

    public async Task<MediaItem?> GetByIdAsync(int id)
    {
        var query = "SELECT * FROM MediaItems WHERE Id = @Id";
        using var connection = _connectionFactory.CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<MediaItem>(query, new { Id = id });
    }

    public async Task<IEnumerable<MediaItem>> SearchAsync(string keyword)
    {
        var query = "SELECT * FROM MediaItems WHERE Title LIKE @Keyword OR Artist LIKE @Keyword";
        using var connection = _connectionFactory.CreateConnection();
        return await connection.QueryAsync<MediaItem>(query, new { Keyword = $"%{keyword}%" });
    }


    // AI RECOMMENDATION
    public async Task<List<MediaItem>> GetItemsByTitlesAsync(List<string> titles)
    {
        if (titles == null || !titles.Any()) 
            return new List<MediaItem>();

        using var connection = _connectionFactory.CreateConnection();

        // SQL Server mặc định không phân biệt hoa thường nên Gemini trả về chữ thường vẫn khớp
        var sql = @"SELECT * FROM MediaItems WHERE Title IN @Titles";
        var items = await connection.QueryAsync<MediaItem>(sql, new { Titles = titles });
        return items.ToList();
    }

    public async Task<List<string>> GetRandomAvailableTitlesAsync(int limit = 50)
    {
        using var connection = _connectionFactory.CreateConnection();

        // Lấy ngẫu nhiên 50 bài hát trong DB làm danh sách ứng viên cho AI
        var sql = "SELECT TOP (@Limit) Title FROM MediaItems ORDER BY NEWID()";
        var titles = await connection.QueryAsync<string>(sql, new { Limit = limit });
        return titles.ToList();
    }

    // Thêm mới: check media tồn tại
    public async Task<bool> ExistsAsync(int mediaItemId)
    {
        using var connection = _connectionFactory.CreateConnection();
        var count = await connection.ExecuteScalarAsync<int>(
            "SELECT COUNT(1) FROM MediaItems WHERE Id = @Id",
            new { Id = mediaItemId });
        return count > 0;
    }
}

