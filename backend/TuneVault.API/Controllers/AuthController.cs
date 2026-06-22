using Microsoft.AspNetCore.Mvc;
using TuneVault.API.DTOs;
using TuneVault.API.Services;

namespace TuneVault.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    // Sử dụng Dependency Injection để tiêm Service vào Controller
    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto registerDto)
    {
        // Controller chỉ làm nhiệm vụ chuyển tiếp request xuống lớp Service xử lý
        AuthResponseDto result = await _authService.RegisterAsync(registerDto);
        return Ok(result);
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto loginDto)
    {
        // Áp dụng async/await xử lý bất đồng bộ
        AuthResponseDto result = await _authService.LoginAsync(loginDto);
        return Ok(result);
    }
}