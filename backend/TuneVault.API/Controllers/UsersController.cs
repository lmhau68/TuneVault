using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TuneVault.Application.DTOs.Users;
using TuneVault.Application.Services;

namespace TuneVault.API.Controllers;

[Authorize] // Bắt buộc client phải gửi kèm JWT Token hợp lệ trong Header (Authorization: Bearer <token>)
[ApiController]
[Route("api/[controller]")] // Route gốc sinh ra sẽ là: /api/users
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    // Tiêm Dependency Injection cho IUserService
    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    /// <summary>
    /// Lấy thông tin hồ sơ của user đang đăng nhập hiện tại
    /// GET: /api/users/me
    /// </summary>
    [HttpGet("me")]
    public async Task<IActionResult> GetMyProfile()
    {
        // 1. Trích xuất UserId từ JWT Token (được lưu trong ClaimTypes.NameIdentifier khi tạo token)
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
        {
            return Unauthorized(new { message = "Không thể xác thực danh tính người dùng." });
        }

        // 2. Dùng var và async/await gọi xuống Service
        var profile = await _userService.GetUserProfileAsync(userId);

        if (profile == null)
        {
            return NotFound(new { message = "Không tìm thấy hồ sơ người dùng." });
        }

        return Ok(profile);
    }

    /// <summary>
    /// Cập nhật thông tin hồ sơ của user đang đăng nhập hiện tại
    /// PUT: /api/users/me
    /// </summary>
    [HttpPut("me")]
    public async Task<IActionResult> UpdateMyProfile([FromBody] UpdateProfileRequest request)
    {
        // 1. Validate data đầu vào
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // 2. Trích xuất UserId từ JWT Token
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
        {
            return Unauthorized(new { message = "Không thể xác thực danh tính người dùng." });
        }

        // 3. Đẩy logic cập nhật xuống Service
        var result = await _userService.UpdateUserProfileAsync(userId, request);

        // 4. Xử lý kết quả trả về
        if (!result.Success)
        {
            return BadRequest(new { message = result.Message });
        }

        return Ok(result);
    }
}