namespace TuneVault.Application.DTOs;

// Thông tin 1 user trong danh sách following/followers
public class FollowUserDto
{
    public int UserId { get; set; }
    public string DisplayName { get; set; } = string.Empty;
    public string? AvatarUrl { get; set; }
    public string? Bio { get; set; }
    public DateTime FollowedAt { get; set; }
}

// Response sau khi toggle follow
public class ToggleFollowResponseDto
{
    public bool IsFollowing { get; set; }
    public string Message { get; set; } = string.Empty;
}

// Trạng thái follow với 1 user cụ thể
public class FollowStatusDto
{
    public int TargetUserId { get; set; }
    public bool IsFollowing { get; set; }
}