namespace TuneVault.Domain.Entities;

public class User
{
    public int Id { get; set; }
    
    public string Username { get; set; } = string.Empty;
    
    public string PasswordHash { get; set; } = string.Empty;
    
    public string Email { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; }
    
    // Navigation property: Mối quan hệ 1-1 với UserProfile
    // Cho phép truy xuất thông tin Profile từ object User một cách tiện lợi
    public UserProfile? Profile { get; set; }
}