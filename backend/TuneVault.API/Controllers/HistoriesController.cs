using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TuneVault.Application.DTOs.History;
using TuneVault.Application.Services;

namespace TuneVault.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class HistoriesController : ControllerBase
{
    private readonly HistoryService _historyService;

    public HistoriesController(HistoryService historyService)
    {
        _historyService = historyService;
    }

    private int GetCurrentUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (claim == null) throw new UnauthorizedAccessException("Không xác định được người dùng.");
        return int.Parse(claim);
    }

    // GET api/histories?limit=10
    // Lấy lịch sử nghe gần đây (mặc định 10 bài theo yêu cầu đề)
    [HttpGet]
    public async Task<IActionResult> GetRecentHistory([FromQuery] int limit = 10)
    {
        var userId = GetCurrentUserId();
        var history = await _historyService.GetRecentHistoryAsync(userId, limit);
        return Ok(new { success = true, data = history });
    }

    // POST api/histories
    // Ghi lịch sử khi bắt đầu phát — frontend gọi endpoint này mỗi khi play
    [HttpPost]
    public async Task<IActionResult> RecordHistory([FromBody] RecordPlayHistoryRequestDto request)
    {
        var userId = GetCurrentUserId();

        try
        {
            await _historyService.RecordPlayHistoryAsync(userId, request);
            return Ok(new { success = true, data = "Đã ghi lịch sử." });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { success = false, errors = ex.Message });
        }
    }

    // DELETE api/histories
    // Xóa toàn bộ lịch sử nghe của user
    [HttpDelete]
    public async Task<IActionResult> ClearHistory()
    {
        var userId = GetCurrentUserId();
        await _historyService.ClearHistoryAsync(userId);
        return Ok(new { success = true, data = "Đã xóa toàn bộ lịch sử." });
    }
}