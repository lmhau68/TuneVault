using Microsoft.AspNetCore.Mvc;
using TuneVault.Application.Services;

namespace TuneVault.API.Controllers;

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
        // Tạm thời gán cứng ID người dùng đăng nhập bằng 1 để thực hiện kiểm thử luồng dữ liệu
        int currentUserId = 2;

        var notifications = await _notificationService.GetMyNotificationsAsync(currentUserId);
        return Ok(notifications);
    }

    [HttpPut("{id}/read")]
    public async Task<IActionResult> MarkAsReadAsync(int id)
    {
        int currentUserId = 2;// Tạm thời gán cứng ID người dùng đăng nhập bằng 1 để thực hiện kiểm thử luồng dữ liệu

        var success = await _notificationService.MarkAsReadAsync(id, currentUserId);

        if (!success)
        {
            return BadRequest("Không thể cập nhật trạng thái hoặc thông báo không thuộc quyền sở hữu của bạn.");
        }

        return Ok(new { success = true, message = "Đã đánh dấu đọc thông báo thành công." });
    }
}
