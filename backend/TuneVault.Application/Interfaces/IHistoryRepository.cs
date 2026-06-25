using TuneVault.Application.DTOs;

namespace TuneVault.Application.Interfaces;

public interface IHistoryRepository
{
    // Lấy lịch sử nghe gần đây (mặc định 10 bài mới nhất theo đề bài)
    Task<List<PlayHistoryResponseDto>> GetRecentHistoryAsync(int userId, int limit = 10);

    // Ghi / cập nhật lịch sử — nếu bài đã có trong ngày thì UPDATE, chưa có thì INSERT
    Task RecordAsync(int userId, int mediaItemId, int? progressInSeconds);

    // Xóa toàn bộ lịch sử của user
    Task ClearHistoryAsync(int userId);

    // Lấy top thể loại nghe gần đây (dùng cho AI recommendation)
    Task<List<string>> GetRecentGenresAsync(int userId, int limit = 5);
}

