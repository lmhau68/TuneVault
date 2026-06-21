using Microsoft.AspNetCore.Mvc;
using TuneVault.Application.DTOs.Auth;
using TuneVault.Application.Services;

namespace TuneVault.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    // Sử dụng Dependency Injection để tiêm IAuthService
    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest request)
    {
        // 1. Controller chỉ nhận request và validate cơ bản
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        // 2. Dùng 'var' và 'async/await' để gọi Service xử lý logic
        var result = await _authService.RegisterAsync(request);

        // 3. Trả về HTTP Status Code phù hợp
        if (!result.Success)
        {
            return BadRequest(new { message = result.Message });
        }

        return Ok(result);
    }

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
            // Trả về 401 Unauthorized khi thông tin đăng nhập không hợp lệ
            return Unauthorized(new { message = result.Message });
        }

        // Trả về 200 OK kèm theo Token (JWT) hoặc dữ liệu AuthResponse
        return Ok(result);
    }
}