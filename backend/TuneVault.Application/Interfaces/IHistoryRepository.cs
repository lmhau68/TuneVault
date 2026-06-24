namespace TuneVault.Application.Interfaces;

public interface IHistoryRepository
{
    // Lấy danh sách thể loại user nghe gần đây nhất
    Task<List<string>> GetRecentGenresAsync(int userId, int limit = 5);
}
