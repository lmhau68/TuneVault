using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TuneVault.Application.DTOs.User;
using TuneVault.Application.Interfaces;

namespace TuneVault.API.Controllers;

[Authorize] // BẮT BUỘC: Yêu cầu phải có Token hợp lệ mới được gọi các API trong này
[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAllUsers()
    {
        var users = await _userService.GetAllUsersAsync();
        return Ok(users);
    }

    // API này vẫn cần ID trên URL vì ai cũng có thể vào xem Profile của người khác (như Facebook)
    [HttpGet("{id}")]
    public async Task<IActionResult> GetProfile(int id)
    {
        var user = await _userService.GetProfileAsync(id);
        
        if (user == null)
        {
            return NotFound(new { Message = $"Không tìm thấy người dùng với ID: {id}" });
        }

        return Ok(user);
    }

    // ĐÃ FIX LỖI IDOR: Xóa {id} khỏi URL. Route giờ chỉ còn /api/users/profile
    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequestDto request)
    {
        // Tự động "móc" ID của người dùng từ chính Token họ gửi lên
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
        {
            // Trả về 401 nếu Token có vấn đề hoặc bị giả mạo mất Claim ID
            return Unauthorized(new { Message = "Token không hợp lệ hoặc không xác định được danh tính." });
        }

        // Truyền chính xác ID của người đang đăng nhập xuống Service
        var isSuccess = await _userService.UpdateProfileAsync(userId, request);
        
        if (!isSuccess)
        {
            return BadRequest(new { Message = "Cập nhật hồ sơ thất bại." });
        }

        return Ok(new { Message = "Cập nhật hồ sơ thành công." });
    }
}