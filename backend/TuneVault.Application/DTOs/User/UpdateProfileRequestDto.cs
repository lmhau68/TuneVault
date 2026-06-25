namespace TuneVault.Application.DTOs.User;

public class UpdateProfileRequestDTO
{
    public string? FullName { get; set;}
    public string? Bio { get; set; }
    public string? AvatarUrl { get; set; }
}