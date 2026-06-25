using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TuneVault.Application.Services;

namespace TuneVault.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FollowsController : ControllerBase
{
    private readonly FollowService _followService;

    public FollowsController(FollowService followService)
    {
        _followService = followService;
    }

    private int GetCurrentUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (claim == null) throw new UnauthorizedAccessException("Không xác định được người dùng.");
        return int.Parse(claim);
    }

    // POST api/follows/{targetUserId}
    // Toggle follow/unfollow user — gọi 1 lần = follow, gọi lần nữa = unfollow
    [HttpPost("{targetUserId:int}")]
    public async Task<IActionResult> ToggleFollow(int targetUserId)
    {
        var userId = GetCurrentUserId();

        try
        {
            var result = await _followService.ToggleFollowAsync(userId, targetUserId);
            return Ok(new { success = true, data = result });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { success = false, errors = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { success = false, errors = ex.Message });
        }
    }

    // GET api/follows/{targetUserId}/status
    // Kiểm tra mình có đang follow user đó không (dùng để render nút Follow/Unfollow)
    [HttpGet("{targetUserId:int}/status")]
    public async Task<IActionResult> GetFollowStatus(int targetUserId)
    {
        var userId = GetCurrentUserId();
        var status = await _followService.GetFollowStatusAsync(userId, targetUserId);
        return Ok(new { success = true, data = status });
    }

    // GET api/follows/following
    // Danh sách những người mình đang follow
    [HttpGet("following")]
    public async Task<IActionResult> GetFollowing()
    {
        var userId = GetCurrentUserId();
        var following = await _followService.GetFollowingAsync(userId);
        return Ok(new { success = true, data = following });
    }

    // GET api/follows/followers
    // Danh sách những người đang follow mình
    [HttpGet("followers")]
    public async Task<IActionResult> GetFollowers()
    {
        var userId = GetCurrentUserId();
        var followers = await _followService.GetFollowersAsync(userId);
        return Ok(new { success = true, data = followers });
    }
}