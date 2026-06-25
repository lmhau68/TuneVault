namespace TuneVault.Application.DTOs.User;

// DTO dùng để trả dữ liệu User về cho Client
public class UserResponseDTO
{
    public int Id { get; set; }
    public string? Username { get; set; }
    public string? FullName { get; set; }
    public string? Email { get; set; }
    public string? Bio { get; set; }
    public string? AvatarUrl { get; set; }
}