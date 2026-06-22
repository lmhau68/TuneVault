using Microsoft.AspNetCore.Mvc;
using TuneVault.API.DTOs.User;
using TuneVault.API.Services;

namespace TuneVault.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    // Sử dụng Dependency Injection để tiêm Service vào Controller
    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        // Dùng var vì tên hàm GetUserByIdAsync đã thể hiện rõ ràng kết quả trả về là một User DTO
        var user = await _userService.GetUserByIdAsync(id);
        return Ok(user);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateProfile(int id, [FromBody] UpdateUserRequestDto updateDto)
    {
        // Controller chỉ nhận request, chuyển tiếp xuống Service xử lý và trả về kết quả HTTP
        var updatedUser = await _userService.UpdateProfileAsync(id, updateDto);
        return Ok(updatedUser);
    }
}