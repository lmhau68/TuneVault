using Microsoft.AspNetCore.Mvc;
using TuneVault.Application.DTOs.Auth;
using TuneVault.Application.Services;

namespace TuneVault.API.Controllers;

[ApiController]
[Route("api/[controller]")] // Route sinh ra sẽ là: /api/auth
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    // Tiêm Dependency Injection (DI) cho IAuthService
    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>
    /// API Đăng ký tài khoản mới
    /// POST: /api/auth/register
    /// </summary>
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        // Khuyến khích: Dù [ApiController] tự động validate, vẫn có thể check thủ công nếu cần
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // Gọi Service xử lý nghiệp vụ bất đồng bộ
        var result = await _authService.RegisterAsync(request);

        if (!result.Success)
        {
            // Trả về HTTP 400 Bad Request nếu đăng ký thất bại (vd: trùng username)
            return BadRequest(new { message = result.Message });
        }

        // Trả về HTTP 200 OK nếu thành công
        return Ok(result);
    }

    /// <summary>
    /// API Đăng nhập
    /// POST: /api/auth/login
    /// </summary>
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var result = await _authService.LoginAsync(request);

        if (!result.Success)
        {
            // Trả về HTTP 401 Unauthorized nếu sai tài khoản hoặc mật khẩu
            return Unauthorized(new { message = result.Message });
        }

        // Trả về HTTP 200 OK kèm theo Token và thông báo
        return Ok(result);
    }
}