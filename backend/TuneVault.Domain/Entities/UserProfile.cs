namespace TuneVault.Domain.Entities;

public class UserProfile
{
    // Alias trong SQL là ProfileId
    public int Id { get; set; } 
    public int UserId { get; set; }
    public string? FullName { get; set; }
    public string? Bio { get; set; }
    public string? AvatarUrl { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? UpdatedAt { get; set; }
}