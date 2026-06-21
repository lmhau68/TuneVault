namespace TuneVault.Domain.Entities;

public class UserProfile
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public string? FullName { get; set; }

    public string? Bio { get; set; }

    public string? AvatarUrl { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}