using Microsoft.AspNetCore.Mvc;
using TuneVault.Application.DTOs.Auth;
using TuneVault.Application.Services;

namespace TuneVault.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    // Sử dụng Dependency Injection trực tiếp lớp AuthService cụ thể
    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDTO request)
    {
        var result = await _authService.RegisterAsync(request);

        if (!result.IsSuccess)
        {
            // Trả về mã lỗi 409 Conflict khi phát hiện trùng Email trong hệ thống
            if (result.ErrorCode == "DuplicateEmail")
            {
                return Conflict(new { Message = result.Message });
            }

            return BadRequest(new { Message = result.Message });
        }

        return Ok(new { Message = result.Message });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDTO request)
    {
        var result = await _authService.LoginAsync(request);

        if (!result.IsSuccess)
        {
            // Trả về mã lỗi 401 Unauthorized khi sai thông tin tài khoản hoặc mật khẩu
            if (result.ErrorCode == "InvalidCredentials")
            {
                return Unauthorized(new { Message = result.Message });
            }

            return BadRequest(new { Message = result.Message });
        }

        // Trả về mã thành công 200 kèm chuỗi mã hóa Token hợp lệ
        return Ok(new 
        { 
            Message = result.Message, 
            Token = result.Token 
        });
    }
}