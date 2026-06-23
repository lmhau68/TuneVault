using Microsoft.AspNetCore.Mvc;
using TuneVault.Application.DTOs.Auth;
using TuneVault.Application.Services;

namespace TuneVault.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AuthService _authService;

    // Dependency Injection
    public AuthController(AuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDTO request)
    {
        // Sử dụng var và async/await
        var response = await _authService.LoginAsync(request);

        if (!response.IsSuccess)
        {
            return Unauthorized(response);
        }

        return Ok(response);
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDTO request)
    {
        var response = await _authService.RegisterAsync(request);

        if (!response.IsSuccess)
        {
            return BadRequest(response);
        }

        return Ok(response);
    }
}