using System;

namespace TuneVault.API.DTOs.User;

public class UserResponseDto
{
    /// <summary>
    /// ID của người dùng (từ bảng Users)
    /// </summary>
    public int Id { get; set; }

    /// <summary>
    /// Email đăng nhập (từ bảng Users)
    /// </summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>
    /// Tên định danh/Hiển thị hệ thống (từ bảng Users)
    /// </summary>
    public string DisplayName { get; set; } = string.Empty;

    /// <summary>
    /// Họ và tên thật (từ bảng UserProfiles)
    /// </summary>
    public string FullName { get; set; } = string.Empty;

    /// <summary>
    /// Tiểu sử ngắn (từ bảng UserProfiles)
    /// </summary>
    public string Bio { get; set; } = string.Empty;

    /// <summary>
    /// Đường dẫn ảnh đại diện (từ bảng UserProfiles)
    /// </summary>
    public string AvatarUrl { get; set; } = string.Empty;

    /// <summary>
    /// Số lượng người đang theo dõi người dùng này (Tính từ bảng Follows)
    /// </summary>
    public int FollowersCount { get; set; }

    /// <summary>
    /// Số lượng người mà người dùng này đang theo dõi (Tính từ bảng Follows)
    /// </summary>
    public int FollowingCount { get; set; }

    /// <summary>
    /// Ngày tham gia hệ thống TuneVault (từ bảng Users)
    /// </summary>
    public DateTime CreatedAt { get; set; }
}