using Microsoft.AspNetCore.Mvc;
using TuneVault.Application.DTOs.Auth;
using TuneVault.Application.Interfaces;

namespace TuneVault.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDTO request)
    {
        var result = await _authService.RegisterAsync(request);

        if (!result.IsSuccess)
        {
            // Trả về lỗi 409 nếu phát hiện trùng lặp Email đăng ký bài bản
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
            // Trả về lỗi 401 nếu sai mật khẩu hoặc không có tài khoản tương ứng
            if (result.ErrorCode == "InvalidCredentials")
            {
                return Unauthorized(new { Message = result.Message });
            }

            return BadRequest(new { Message = result.Message });
        }

        // Trả về mã lỗi 200 kèm theo Token khi xác thực thành công
        return Ok(new 
        { 
            Message = result.Message, 
            Token = result.Token 
        });
    }
}