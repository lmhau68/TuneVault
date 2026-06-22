using System;

namespace TuneVault.Domain.Entities;

public class User
{
    /// <summary>
    /// Khóa chính tự tăng (Id INT IDENTITY(1,1))
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Địa chỉ email tài khoản (Email NVARCHAR(255) NOT NULL UNIQUE)
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Chuỗi mật khẩu đã được mã hóa bảo mật (PasswordHash NVARCHAR(500) NOT NULL)
    /// </summary>
    public string PasswordHash { get; set; } = string.Empty;

    /// <summary>
    /// Tên hiển thị công khai trên ứng dụng (DisplayName NVARCHAR(100) NOT NULL)
    /// </summary>
    public string DisplayName { get; set; } = string.Empty;

    /// <summary>
    /// Thời gian khởi tạo tài khoản (CreatedAt DATETIME2 NOT NULL)
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Thời gian cập nhật thông tin gần nhất, cho phép NULL (UpdatedAt DATETIME2 NULL)
    /// </summary>
    public DateTime? UpdatedAt { get; set; }
}