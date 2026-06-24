namespace TuneVault.Application.DTOs.AI;

public class RecommendationDto
{
    // Đã sửa: Trả về danh sách object bài hát thật, không trả string thô nữa
    public List<RecommendedMediaDto> Recommendations { get; set; } = new();
}
