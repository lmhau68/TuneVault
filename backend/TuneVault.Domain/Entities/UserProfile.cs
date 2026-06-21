namespace TuneVault.Domain.Entities;

public class UserProfile
{
    public int Id { get; set; }
    
    // Khóa ngoại (Foreign Key) liên kết với bảng Users
    public int UserId { get; set; } 
    
    public string DisplayName { get; set; } = string.Empty;
    
    // Các thuộc tính có thể null (được đánh dấu bằng '?') 
    // vì người dùng có thể chưa cập nhật avatar hoặc tiểu sử
    public string? AvatarUrl { get; set; }
    
    public string? Bio { get; set; }
    
    public DateTime? UpdatedAt { get; set; }
}