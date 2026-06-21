using Microsoft.AspNetCore.Mvc;
using TuneVault.Application.DTOs.Users;
using TuneVault.Application.Services;

namespace TuneVault.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    // Tiêm Dependency Injection cho IUserService
    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    // Endpoint: GET /api/users/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetProfile(int id)
    {
        // Sử dụng var và async/await gọi xuống Service
        var profile = await _userService.GetUserProfileAsync(id);

        if (profile == null)
        {
            return NotFound(new { message = "Không tìm thấy hồ sơ người dùng." });
        }

        return Ok(profile);
    }

    // Endpoint: PUT /api/users/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProfile(int id, [FromBody] UpdateProfileRequest request)
    {
        // 1. Controller chỉ nhận request và validate cơ bản
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // 2. Đẩy logic cập nhật xuống Service
        var result = await _userService.UpdateUserProfileAsync(id, request);

        // 3. Xử lý kết quả trả về
        if (!result.Success)
        {
            return BadRequest(new { message = result.Message });
        }

        return Ok(result);
    }
}