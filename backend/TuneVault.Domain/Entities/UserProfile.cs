using System;

namespace TuneVault.Domain.Entities;

public class UserProfile
{
    /// <summary>
    /// Khóa chính của hồ sơ (Id INT IDENTITY(1,1))
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Liên kết 1-1 tới bảng Users (UserId INT NOT NULL UNIQUE)
    /// </summary>
    public int UserId { get; set; }

    /// <summary>
    /// Họ và tên đầy đủ (FullName NVARCHAR(150) NULL)
    /// </summary>
    public string? FullName { get; set; }

    /// <summary>
    /// Tiểu sử hoặc mô tả bản thân (Bio NVARCHAR(500) NULL)
    /// </summary>
    public string? Bio { get; set; }

    /// <summary>
    /// Đường dẫn URL tới ảnh đại diện (AvatarUrl NVARCHAR(500) NULL)
    /// </summary>
    public string? AvatarUrl { get; set; }

    /// <summary>
    /// Thời gian hồ sơ được khởi tạo (CreatedAt DATETIME2 NOT NULL)
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Thời gian cập nhật hồ sơ gần nhất (UpdatedAt DATETIME2 NULL)
    /// </summary>
    public DateTime? UpdatedAt { get; set; }
}