using TuneVault.Application.DTOs.Users;
using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Services;

// (Interface này đã được định nghĩa ở bước trước, đặt ở đây hoặc file IUserService.cs đều được)
// public interface IUserService { ... }

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;

    // Tiêm Dependency Injection (DI)
    public UserService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<UserProfileResponse?> GetUserProfileAsync(int userId)
    {
        // 1. Lấy thông tin user (bao gồm cả profile) từ Database thông qua Repository
        var user = await _userRepository.GetUserByIdAsync(userId);

        if (user == null)
        {
            return null; // Trả về null để Controller biết và trả ra 404 NotFound
        }

        // 2. Map dữ liệu từ Domain Entity sang DTO để ẩn giấu cấu trúc DB thực tế và PasswordHash
        var response = new UserProfileResponse
        {
            UserId = user.Id,
            Username = user.Username,
            // Sử dụng Null-conditional operator (?.) và Null-coalescing operator (??) 
            // Nếu DisplayName null, lấy Username làm mặc định
            DisplayName = user.Profile?.DisplayName ?? user.Username, 
            AvatarUrl = user.Profile?.AvatarUrl,
            Bio = user.Profile?.Bio
        };

        return response;
    }

    public async Task<UserUpdateResponse> UpdateUserProfileAsync(int userId, UpdateProfileRequest request)
    {
        // 1. Kiểm tra xem người dùng có tồn tại không
        var existingUser = await _userRepository.GetUserByIdAsync(userId);
        if (existingUser == null)
        {
            return new UserUpdateResponse
            {
                Success = false,
                Message = "Người dùng không tồn tại trong hệ thống."
            };
        }

        // 2. Khởi tạo Entity Profile từ DTO đầu vào
        var profileToUpdate = new UserProfile
        {
            UserId = userId, // Ràng buộc khóa ngoại
            DisplayName = request.DisplayName,
            AvatarUrl = request.AvatarUrl,
            Bio = request.Bio,
            UpdatedAt = DateTime.UtcNow
        };

        // 3. Gọi Repository để thực thi câu lệnh SQL UPDATE (hoặc UPSERT - Update/Insert)
        var isUpdated = await _userRepository.UpdateUserProfileAsync(profileToUpdate);

        if (!isUpdated)
        {
            return new UserUpdateResponse
            {
                Success = false,
                Message = "Đã xảy ra lỗi khi cập nhật hồ sơ vào cơ sở dữ liệu."
            };
        }

        return new UserUpdateResponse
        {
            Success = true,
            Message = "Cập nhật thông tin hồ sơ thành công!"
        };
    }
}