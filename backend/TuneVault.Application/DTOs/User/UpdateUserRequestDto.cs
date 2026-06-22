using System.ComponentModel.DataAnnotations;

namespace TuneVault.API.DTOs.User;

public class UpdateUserRequestDto
{
    [MaxLength(150, ErrorMessage = "Họ và tên không được vượt quá 150 ký tự.")]
    public string FullName { get; set; } = string.Empty;

    [MaxLength(500, ErrorMessage = "Tiểu sử (Bio) không được vượt quá 500 ký tự.")]
    public string Bio { get; set; } = string.Empty;

    [Url(ErrorMessage = "Đường dẫn ảnh đại diện (Avatar) không hợp lệ.")]
    [MaxLength(500, ErrorMessage = "Đường dẫn ảnh không được vượt quá 500 ký tự.")]
    public string AvatarUrl { get; set; } = string.Empty;
}