using Dapper;
using TuneVault.Application.DTOs;
using TuneVault.Application.Interfaces;

namespace TuneVault.Infrastructure.Repositories;

public class HistoryRepository : IHistoryRepository
{
    private readonly IDbConnectionFactory _connectionFactory;

    public HistoryRepository(IDbConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    // Lấy N bài nghe gần nhất, JOIN MediaItems để có đủ thông tin hiển thị
    public async Task<List<PlayHistoryResponseDto>> GetRecentHistoryAsync(int userId, int limit = 10)
    {
        using var connection = _connectionFactory.CreateConnection();

        var sql = @"
            SELECT TOP (@Limit)
                ph.Id,
                m.Id            AS MediaItemId,
                m.Title,
                m.Artist,
                m.Album,
                m.Genre,
                m.MediaType,
                m.ThumbnailPath,
                m.DurationInSeconds,
                ph.ProgressInSeconds,
                ph.PlayedAt
            FROM PlayHistories ph
            INNER JOIN MediaItems m ON ph.MediaItemId = m.Id
            WHERE ph.UserId = @UserId
            ORDER BY ph.PlayedAt DESC";

        var result = await connection.QueryAsync<PlayHistoryResponseDto>(sql, new
        {
            UserId = userId,
            Limit = limit
        });

        return result.ToList();
    }

    // Ghi lịch sử: nếu hôm nay đã nghe bài này rồi thì cập nhật PlayedAt + Progress,
    // chưa có thì INSERT mới — tránh spam lịch sử khi user tua đi tua lại
    public async Task RecordAsync(int userId, int mediaItemId, int? progressInSeconds)
    {
        using var connection = _connectionFactory.CreateConnection();

        var sql = @"
            IF EXISTS (
                SELECT 1 FROM PlayHistories
                WHERE UserId = @UserId
                  AND MediaItemId = @MediaItemId
                  AND CAST(PlayedAt AS DATE) = CAST(GETDATE() AS DATE)
            )
                UPDATE PlayHistories
                SET PlayedAt = GETDATE(),
                    ProgressInSeconds = @ProgressInSeconds
                WHERE UserId = @UserId
                  AND MediaItemId = @MediaItemId
                  AND CAST(PlayedAt AS DATE) = CAST(GETDATE() AS DATE)
            ELSE
                INSERT INTO PlayHistories (UserId, MediaItemId, ProgressInSeconds, PlayedAt)
                VALUES (@UserId, @MediaItemId, @ProgressInSeconds, GETDATE())";

        await connection.ExecuteAsync(sql, new
        {
            UserId = userId,
            MediaItemId = mediaItemId,
            ProgressInSeconds = progressInSeconds
        });
    }

    // Xóa sạch lịch sử của user
    public async Task ClearHistoryAsync(int userId)
    {
        using var connection = _connectionFactory.CreateConnection();

        var sql = "DELETE FROM PlayHistories WHERE UserId = @UserId";
        await connection.ExecuteAsync(sql, new { UserId = userId });
    }

    // Lấy top thể loại nghe gần nhất (dùng cho AI recommendation)
    public async Task<List<string>> GetRecentGenresAsync(int userId, int limit = 5)
    {
        using var connection = _connectionFactory.CreateConnection();
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

