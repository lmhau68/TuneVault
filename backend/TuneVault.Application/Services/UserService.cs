using System;
using System.IO;
using System.Threading.Tasks;
using TuneVault.API.DTOs.User; // Namespace chứa các DTOs hiển thị cho Client

namespace TuneVault.Application.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;
    private readonly IUserProfileRepository _profileRepository;
    private readonly IFollowRepository _followRepository;

    // Sử dụng Dependency Injection để tiêm các Repository cần thiết vào Service
    public UserService(
        IUserRepository userRepository, 
        IUserProfileRepository profileRepository,
        IFollowRepository followRepository)
    {
        _userRepository = userRepository;
        _profileRepository = profileRepository;
        _followRepository = followRepository;
    }

    public async Task<UserResponseDto> GetUserByIdAsync(int id)
    {
        // 1. Logic nghiệp vụ: Kiểm tra sự tồn tại của User
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null)
        {
            throw new KeyNotFoundException($"Không tìm thấy người dùng có Id = {id}");
        }

        // 2. Lấy thêm thông tin chi tiết từ bảng hồ sơ (UserProfiles)
        var profile = await _profileRepository.GetByUserIdAsync(id);

        // 3. Đếm số lượng người theo dõi (Followers) và đang theo dõi (Following)
        var followersCount = await _followRepository.GetFollowersCountAsync(id);
        var followingCount = await _followRepository.GetFollowingCountAsync(id);

        // 4. Khởi tạo DTO trả về (Dùng var vì kiểu dữ liệu khởi tạo đã rõ ràng)
        var userResponse = new UserResponseDto
        {
            Id = user.Id,
            Email = user.Email,
            DisplayName = user.DisplayName,
            FullName = profile?.FullName ?? string.Empty,
            Bio = profile?.Bio ?? string.Empty,
            AvatarUrl = profile?.AvatarUrl ?? string.Empty,
            FollowersCount = followersCount,
            FollowingCount = followingCount,
            CreatedAt = user.CreatedAt
        };

        return userResponse;
    }

    public async Task<UserResponseDto> UpdateProfileAsync(int id, UpdateUserRequestDto updateDto)
    {
        // 1. Logic nghiệp vụ: Xác thực tài khoản có tồn tại trước khi cập nhật hồ sơ
        var user = await _userRepository.GetByIdAsync(id);
        if (user == null)
        {
            throw new KeyNotFoundException($"Không thể cập nhật. Người dùng có Id = {id} không tồn tại.");
        }

        // 2. Lấy thông tin hồ sơ hiện tại
        var profile = await _profileRepository.GetByUserIdAsync(id);
        if (profile == null)
        {
            // Dự phòng trường hợp hiếm khi User chưa có Profile, tự động khởi tạo mới
            profile = new UserProfile { UserId = id, CreatedAt = DateTime.UtcNow };
            await _profileRepository.CreateAsync(profile);
        }

        // 3. Logic nghiệp vụ: Gán các giá trị mới từ DTO vào thực thể để chuẩn bị lưu
        profile.FullName = updateDto.FullName;
        profile.Bio = updateDto.Bio;
        profile.AvatarUrl = updateDto.AvatarUrl;
        profile.UpdatedAt = DateTime.UtcNow;

        // 4. Gọi Repository thực thi cập nhật xuống Database
        await _profileRepository.UpdateAsync(profile);

        // 5. Trả về thông tin chi tiết sau cập nhật bằng cách gọi lại hàm Get dữ liệu sạch
        return await GetUserByIdAsync(id);
    }

    public async Task<bool> FollowUserAsync(int followerId, int followingId)
    {
        // 1. Logic nghiệp vụ: Không cho phép tự theo dõi chính mình (Ràng buộc CK_Follows_NotSelf từ DB)
        if (followerId == followingId)
        {
            throw new InvalidOperationException("Bạn không thể tự theo dõi chính bản thân mình.");
        }

        // 2. Kiểm tra xem đối tượng được follow có tồn tại trong hệ thống hay không
        var targetUser = await _userRepository.GetByIdAsync(followingId);
        if (targetUser == null)
        {
            throw new KeyNotFoundException("Người dùng bạn muốn theo dõi không tồn tại.");
        }

        // 3. Kiểm tra xem đã theo dõi từ trước chưa (Tránh lỗi trùng UNIQUE Constraint)
        var isAlreadyFollowing = await _followRepository.IsFollowingAsync(followerId, followingId);
        if (isAlreadyFollowing)
        {
            return false; // Đã theo dõi rồi thì không xử lý thêm
        }

        // 4. Thực thi lưu mối quan hệ mới vào DB thông qua Repository
        return await _followRepository.AddFollowAsync(followerId, followingId);
    }
}