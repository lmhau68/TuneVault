namespace TuneVault.Application.DTOs;

public class FollowUserResponseDto
{
    public int UserId { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string? Bio { get; set; }
    public DateTime FollowedAt { get; set; }
}