namespace TuneVault.Domain.Entities;

public class UserProfile
{
    // Cột: Id INT IDENTITY(1,1) PRIMARY KEY
    public int Id { get; set; }
    
    // Cột: UserId INT NOT NULL UNIQUE (Khóa ngoại liên kết với bảng Users)
    public int UserId { get; set; } 
    
    // Cột: FullName NVARCHAR(150) NULL
    // Dấu '?' biểu thị cho phép giá trị NULL dưới Database
    public string? FullName { get; set; }
    
    // Cột: Bio NVARCHAR(500) NULL
    public string? Bio { get; set; }
    
    // Cột: AvatarUrl NVARCHAR(500) NULL
    public string? AvatarUrl { get; set; }
    
    // Cột: CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE()
    public DateTime CreatedAt { get; set; }
    
    // Cột: UpdatedAt DATETIME2 NULL
    public DateTime? UpdatedAt { get; set; }
}