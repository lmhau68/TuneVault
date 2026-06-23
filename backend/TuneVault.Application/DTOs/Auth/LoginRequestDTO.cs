using System.ComponentModel.DataAnnotations;

namespace TuneVault.Application.DTOs.Auth;

public class LoginRequestDTO
{
    [Required(ErrorMessage = "Vui lòng nhập Email hoặc Tên đăng nhập.")]
    public string UsernameOrEmail { get; set; } = string.Empty;

    [Required(ErrorMessage = "Vui lòng nhập Mật khẩu.")]
    public string Password { get; set; } = string.Empty;
}