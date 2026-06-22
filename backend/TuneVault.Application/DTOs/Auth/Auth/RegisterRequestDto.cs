using System.ComponentModel.DataAnnotations;

namespace TuneVault.API.DTOs.Auth;

public class RegisterRequestDto
{
    [Required(ErrorMessage = "Email là thông tin bắt buộc.")]
    [EmailAddress(ErrorMessage = "Định dạng Email không hợp lệ.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Tên hiển thị là bắt buộc.")]
    [MinLength(3, ErrorMessage = "Tên hiển thị phải có ít nhất 3 ký tự.")]
    [MaxLength(100, ErrorMessage = "Tên hiển thị không được vượt quá 100 ký tự.")]
    public string Username { get; set; } = string.Empty;

    [Required(ErrorMessage = "Mật khẩu là bắt buộc.")]
    [MinLength(6, ErrorMessage = "Mật khẩu phải có ít nhất 6 ký tự để đảm bảo an toàn.")]
    public string Password { get; set; } = string.Empty;
}