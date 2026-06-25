using TuneVault.Application.DTOs;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Services;

public class FollowService
{
    private readonly IFollowRepository _followRepository;

    // Không cần IUserRepository nữa, FollowRepository tự check
    public FollowService(IFollowRepository followRepository)
    {
        _followRepository = followRepository;
    }

    public async Task<ToggleFollowResponseDto> ToggleFollowAsync(int followerUserId, int targetUserId)
    {
        if (followerUserId == targetUserId)
            throw new InvalidOperationException("Không thể tự follow chính mình.");

        var targetExists = await _followRepository.UserExistsAsync(targetUserId);
        if (!targetExists)
            throw new KeyNotFoundException($"Không tìm thấy người dùng với Id = {targetUserId}.");

        var isNowFollowing = await _followRepository.ToggleFollowAsync(followerUserId, targetUserId);

        return new ToggleFollowResponseDto
        {
            IsFollowing = isNowFollowing,
            Message = isNowFollowing ? "Đã follow người dùng." : "Đã unfollow người dùng."
        };
    }

    public async Task<FollowStatusDto> GetFollowStatusAsync(int followerUserId, int targetUserId)
    {
        var isFollowing = await _followRepository.IsFollowingAsync(followerUserId, targetUserId);
        return new FollowStatusDto { TargetUserId = targetUserId, IsFollowing = isFollowing };
    }

    public async Task<List<FollowUserResponseDto>> GetFollowingAsync(int userId)
        => await _followRepository.GetFollowingAsync(userId);

    public async Task<List<FollowUserResponseDto>> GetFollowersAsync(int userId)
        => await _followRepository.GetFollowersAsync(userId);
}