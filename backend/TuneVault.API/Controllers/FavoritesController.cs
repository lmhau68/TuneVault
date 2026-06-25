using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TuneVault.Application.Services;

namespace TuneVault.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Tất cả endpoint đều yêu cầu đăng nhập
public class FavoritesController : ControllerBase
{
    private readonly FavoriteService _favoriteService;

    public FavoritesController(FavoriteService favoriteService)
    {
        _favoriteService = favoriteService;
    }

    // Lấy userId từ JWT token
    private int GetCurrentUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (claim == null) throw new UnauthorizedAccessException("Không xác định được người dùng.");
        return int.Parse(claim);
    }

    // GET api/favorites?page=1&pageSize=20
    // Lấy danh sách media yêu thích của user đang đăng nhập
    [HttpGet]
    public async Task<IActionResult> GetMyFavorites([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var userId = GetCurrentUserId();
        var favorites = await _favoriteService.GetMyFavoritesAsync(userId, page, pageSize);
        return Ok(new { success = true, data = favorites });
    }

    // POST api/favorites/{mediaItemId}
    // Toggle like/unlike — gọi 1 lần = like, gọi lần nữa = unlike
    [HttpPost("{mediaItemId:int}")]
    public async Task<IActionResult> ToggleFavorite(int mediaItemId)
    {
        var userId = GetCurrentUserId();

        try
        {
            var result = await _favoriteService.ToggleFavoriteAsync(userId, mediaItemId);
            return Ok(new { success = true, data = result });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { success = false, errors = ex.Message });
        }
    }

    // GET api/favorites/{mediaItemId}/status
    // Kiểm tra user hiện tại đã like bài này chưa (dùng để render icon tim trên frontend)
    [HttpGet("{mediaItemId:int}/status")]
    public async Task<IActionResult> GetFavoriteStatus(int mediaItemId)
    {
        var userId = GetCurrentUserId();
        var status = await _favoriteService.GetFavoriteStatusAsync(userId, mediaItemId);
        return Ok(new { success = true, data = status });
    }
}