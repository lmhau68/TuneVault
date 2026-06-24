using TuneVault.Application.DTOs;

namespace TuneVault.Application.Interfaces;

public interface IFollowRepository
{
    Task<bool> ToggleFollowAsync(int followerUserId, int followingUserId);
    Task<bool> IsFollowingAsync(int followerUserId, int followingUserId);
    Task<List<FollowUserResponseDto>> GetFollowingAsync(int userId);
    Task<List<FollowUserResponseDto>> GetFollowersAsync(int userId);
    Task<bool> UserExistsAsync(int userId); // check user tồn tại, không cần IUserRepository
}