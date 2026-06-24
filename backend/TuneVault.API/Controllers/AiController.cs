using MediatR;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using TuneVault.Application.AI;

namespace TuneVault.API.Controllers;

[Authorize] // <--- Bọc bảo mật toàn bộ các API trong Controller này
[ApiController]
[Route("api/[controller]")]
public class AiController : ControllerBase
{
    private readonly IMediator _mediator;

    public AiController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Lấy danh sách bài hát khuyến nghị từ AI dựa trên gu âm nhạc thực tế
    /// </summary>
    [HttpGet("recommendations")]
    public async Task<IActionResult> GetRecommendations()
    {
        // 1. Trích xuất UserId từ JWT Token đã được xác thực
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int currentUserId))
        {
            return Unauthorized(new { message = "Không thể xác thực danh tính người dùng hoặc Token không hợp lệ." });
        }

        // 2. Gửi Query kèm Id thật xuống MediatR để xử lý logic ngầm
        var result = await _mediator.Send(new GetRecommendationsQuery(currentUserId));
        
        return Ok(result);
    }
}