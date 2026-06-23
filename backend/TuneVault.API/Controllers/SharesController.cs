namespace TuneVault.API.Controllers;

using TuneVault.Application.DTOs.Shares;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using TuneVault.Application.Services;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class SharesController : ControllerBase
{
    // TODO: Viet endpoint cho Shares
    private readonly ShareService _shareService;
    public SharesController(ShareService shareService)
    {
        _shareService= shareService;
    }


    [HttpGet("with-me")]
    public async Task<IActionResult> GetSharedWithMeAsync()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int currentUserId))
        {
            return Unauthorized(new { message = "Không thể xác thực danh tính người dùng." });
        }
        var result = await _shareService.GetSharedWithMeAsync(currentUserId);
        return Ok(result);
    }

    [HttpGet("by-me")]
    public async Task<IActionResult> GetSharedByMeAsync()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int currentUserId))
        {
            return Unauthorized(new { message = "Không thể xác thực danh tính người dùng." });
        }
        var result = await _shareService.GetSharedByMeAsync(currentUserId);
        return Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> CreateAsync([FromBody] CreateShareRequest request)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int currentUserId))
        {
            return Unauthorized(new { message = "Không thể xác thực danh tính người dùng." });
        }
        var response = await _shareService.ShareMediaAsync(currentUserId, request);
        return Ok(response);
    }

}
