using TuneVault.Application.DTOs.History;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Services;

public class HistoryService
{
    private readonly IHistoryRepository _historyRepository;
    private readonly IMediaRepository _mediaRepository;

    public HistoryService(IHistoryRepository historyRepository, IMediaRepository mediaRepository)
    {
        _historyRepository = historyRepository;
        _mediaRepository = mediaRepository;
    }

    // Lấy 10 bài nghe gần nhất (theo yêu cầu đề bài)
    public async Task<List<PlayHistoryResponseDto>> GetRecentHistoryAsync(int userId, int limit = 10)
    {
        return await _historyRepository.GetRecentHistoryAsync(userId, limit);
    }

    // Ghi lịch sử khi user bắt đầu phát hoặc cập nhật tiến độ
    public async Task RecordPlayHistoryAsync(int userId, RecordPlayHistoryRequestDto request)
    {
        // Validate media tồn tại trước khi ghi
        var mediaExists = await _mediaRepository.ExistsAsync(request.MediaItemId);
        if (!mediaExists)
            throw new KeyNotFoundException($"Không tìm thấy media với Id = {request.MediaItemId}.");

        await _historyRepository.RecordAsync(userId, request.MediaItemId, request.ProgressInSeconds);
    }

    // Xóa toàn bộ lịch sử của user
    public async Task ClearHistoryAsync(int userId)
    {
        await _historyRepository.ClearHistoryAsync(userId);
    }
}