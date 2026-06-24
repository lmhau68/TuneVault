namespace TuneVault.API.Controllers;

using Microsoft.AspNetCore.Mvc;
using TuneVault.Application.Services;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class NotificationsController : ControllerBase
{
    // TODO: Viet endpoint cho Notifications
    private readonly NotificationService _notificationService;

    public NotificationsController(NotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpGet]
    public async Task<IActionResult> GetMyNotificationsAsync()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int currentUserId))
        {
            return Unauthorized(new { message = "Không thể xác thực danh tính người dùng." });
        }
        var notifications = await _notificationService.GetMyNotificationsAsync(currentUserId);
        return Ok(notifications);
    }

    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkAsReadAsync(int id)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int currentUserId))
        {
            return Unauthorized(new { message = "Không thể xác thực danh tính người dùng." });
        }
        
        var success = await _notificationService.MarkAsReadAsync(id, currentUserId);

        if (!success)
        {
            return BadRequest("Không thể cập nhật trạng thái hoặc thông báo không thuộc quyền sở hữu của bạn.");
        }

        return Ok(new { success = true, message = "Đã đánh dấu đọc thông báo thành công." });
    }
}
