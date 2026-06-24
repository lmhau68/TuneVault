using MediatR;
using TuneVault.Application.DTOs.AI;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.AI;

public class GetRecommendationsHandler
    : IRequestHandler<GetRecommendationsQuery, RecommendationDto>
{
    private readonly IGeminiService _geminiService;
    private readonly IHistoryRepository _historyRepository;
    private readonly IFavoriteRepository _favoriteRepository;
    private readonly IMediaRepository _mediaRepository;

    public GetRecommendationsHandler(
        IGeminiService geminiService,
        IHistoryRepository historyRepository,
        IFavoriteRepository favoriteRepository,
        IMediaRepository mediaRepository)
    {
        _geminiService = geminiService;
        _historyRepository = historyRepository;
        _favoriteRepository = favoriteRepository;
        _mediaRepository = mediaRepository;
    }

    public async Task<RecommendationDto> Handle(
        GetRecommendationsQuery request,
        CancellationToken cancellationToken)
    {
        // 1. Lấy gu âm nhạc thực tế của user từ DB thông qua các Repository
        var recentGenres = await _historyRepository.GetRecentGenresAsync(request.UserId);
        var favoriteArtists = await _favoriteRepository.GetFavoriteArtistsAsync(request.UserId);

        // Nếu user mới chưa có lịch sử, dùng thể loại mặc định để tránh trống Prompt
        string genresText = recentGenres.Any() ? string.Join(", ", recentGenres) : "Pop, Chill";
        string artistsText = favoriteArtists.Any() ? string.Join(", ", favoriteArtists) : "Hà Anh Tuấn, Vũ.";

        // Lấy danh sách bài hát thực tế từ CSDL để truyền vào Prompt
        var availableTitles = await _mediaRepository.GetRandomAvailableTitlesAsync(50);
        string availableSongsText = string.Join(", ", availableTitles);

        // 2. Build Prompt động hoàn toàn
        var prompt = $"""
            Bạn là AI chuyên gia phân tích tâm lý và gợi ý audio/video cho ứng dụng TuneVault.

            [DỮ LIỆU ĐẦU VÀO CỦA NGƯỜI DÙNG]
            - Các thể loại vừa nghe gần nhất: {genresText}
            - Các ca sĩ vừa tương tác/thả tim: {artistsText}

            [KHO media (audio/video) ỨNG VIÊN]
            {availableSongsText}

            [NHIỆM VỤ CỦA BẠN]
            Thực hiện ngầm 2 bước sau:
            Bước 1: Phân tích TÂM TRẠNG (Mood) hiện tại của người dùng dựa trên "Dữ liệu đầu vào" (Họ đang buồn, vui, cần tập trung, hay đang thư giãn?).
            Bước 2: Chọn ra ĐÚNG 5 media trong "Kho media (audio/video) ứng viên" sao cho đồng điệu nhất với TÂM TRẠNG mà bạn vừa phân tích ra.

            [YÊU CẦU ĐẦU RA BẮT BUỘC]
            - CHỈ in ra đúng tên media (audio/video), mỗi media trên một dòng.
            - Tuyệt đối KHÔNG in ra phần phân tích tâm trạng, không viết thêm bất kỳ chữ hay ký tự giải thích nào khác..
            - Tuyệt đối KHÔNG in kèm tên ca sĩ, KHÔNG in thể loại, KHÔNG đánh số.
            """;
        // 3. Gọi Gemini API lấy danh sách text
        var result = await _geminiService.CompleteAsync(prompt);

        // BƯỚC RỬA DATA (Xử lý sự ương bướng của AI)
        var suggestedTitles = result
            .Split('\n')
            .Select(x => x.Trim())
            // 1. Dùng Regex xóa các ký tự rác ở đầu dòng như: "1. ", "- ", "* "
            .Select(x => System.Text.RegularExpressions.Regex.Replace(x, @"^(\d+\.|\-|\*)\s*", ""))
            // 2. Xóa các dấu ngoặc kép mà AI hay tự ý bọc quanh tên bài hát
            .Select(x => x.Replace("\"", "").Replace("'", "").Trim())
            // 3. Lọc bỏ các dòng trống hoặc các câu chat rác của AI (ví dụ: "Dưới đây là gợi ý...")
            // (Thường tên bài hát sẽ không dài quá 100 ký tự)
            .Where(x => !string.IsNullOrWhiteSpace(x) && x.Length < 100)
            .ToList();

        var finalRecommendations = new List<RecommendedMediaDto>();

        if (suggestedTitles.Any())
        {
            // 4. Tra cứu ngược lại CSDL để lấy ra MediaItem thực sự (thỏa mãn yêu cầu đề bài)
            var dbItems = await _mediaRepository.GetItemsByTitlesAsync(suggestedTitles);

            // 5. Map dữ liệu từ Entity sang DTO để Frontend hiển thị và phát được nhạc
            finalRecommendations = dbItems.Select(item => new RecommendedMediaDto
            {
                Id = item.Id,
                Title = item.Title,
                Artist = item.Artist ?? "Chưa rõ",
                Genre = item.Genre ?? "Pop",
                Album = item.Album ?? "Chưa rõ",
                ThumbnailPath = item.ThumbnailPath,
                MediaType = item.MediaType,
                FilePath = item.FilePath
            }).ToList();
        }
        // 6. Nếu AI tìm không ra bài nào, bốc đại 5 bài ngẫu nhiên từ DB bù vào
        if (!finalRecommendations.Any())
        {
            Console.WriteLine("[AI LOG] AI trả về rỗng, kích hoạt fallback lấy nhạc ngẫu nhiên.");
            var fallbackTitles = await _mediaRepository.GetRandomAvailableTitlesAsync(5);
            var fallbackItems = await _mediaRepository.GetItemsByTitlesAsync(fallbackTitles);
            
            finalRecommendations = fallbackItems.Select(item => new RecommendedMediaDto
            {
                Id = item.Id,
                Title = item.Title,
                Artist = item.Artist ?? "Chưa rõ",
                Genre = item.Genre ?? "Chưa rõ",
                Album = item.Album ?? "Chưa rõ",
                ThumbnailPath = item.ThumbnailPath,
                MediaType = item.MediaType,
                FilePath = item.FilePath
            }).ToList();
        }
        return new RecommendationDto
        {
            Recommendations = finalRecommendations
        };
    }
}