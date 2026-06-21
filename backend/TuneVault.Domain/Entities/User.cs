namespace TuneVault.Domain.Entities;

public class User
{
    // Cột: Id INT IDENTITY(1,1) PRIMARY KEY
    public int Id { get; set; }
    
    // Cột: Email NVARCHAR(255) NOT NULL UNIQUE
    public string Email { get; set; } = string.Empty;
    
    // Cột: PasswordHash NVARCHAR(500) NOT NULL
    public string PasswordHash { get; set; } = string.Empty;
    
    // Cột: DisplayName NVARCHAR(100) NOT NULL
    public string DisplayName { get; set; } = string.Empty;
    
    // Cột: CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
    public DateTime CreatedAt { get; set; }
    
    // Cột: UpdatedAt DATETIME2 NULL
    // Dấu '?' cực kỳ quan trọng vì SQL cho phép NULL
    public DateTime? UpdatedAt { get; set; }
    
    // Navigation property: Mối quan hệ 1-1 với bảng UserProfiles
    // Dùng để Dapper map dữ liệu khi dùng lệnh LEFT JOIN
    public UserProfile? Profile { get; set; }
}