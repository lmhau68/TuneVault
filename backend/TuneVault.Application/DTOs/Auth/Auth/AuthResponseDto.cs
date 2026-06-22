using System;

namespace TuneVault.API.DTOs.Auth;

public class AuthResponseDto
{
    /// <summary>
    /// Chuỗi JWT Token dùng để Client gắn vào Header (Bearer) cho các request sau này
    /// </summary>
    public string Token { get; set; } = string.Empty;

    /// <summary>
    /// Tên người dùng để hiển thị trên giao diện (Xin chào, [Username]!)
    /// </summary>
    public string Username { get; set; } = string.Empty;

    /// <summary>
    /// Thời điểm Token hết hạn, giúp Client biết khi nào cần đăng nhập lại hoặc refresh token
    /// </summary>
    public DateTime ExpiresAt { get; set; }
}