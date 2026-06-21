using TuneVault.Application.DTOs.Users;
using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Services;

// Khai báo Interface (Bản hợp đồng cho UsersController gọi)
public interface IUserService
{
    Task<UserProfileResponse?> GetUserProfileAsync(int userId);
    Task<UserUpdateResponse> UpdateUserProfileAsync(int userId, UpdateProfileRequest request);
}

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;

    // Tiêm IUserRepository qua Dependency Injection (DI)
    public UserService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<UserProfileResponse?> GetUserProfileAsync(int userId)
    {
        // 1. Lấy thông tin user (kèm profile) từ Database
        var user = await _userRepository.GetUserByIdAsync(userId);

        if (user == null)
        {
            return null; // Trả về null để Controller ném ra lỗi 404 NotFound
        }

        // 2. Chuyển đổi (Map) dữ liệu từ Entity sang DTO để trả về cho Client
        // Việc này giúp giấu đi các thông tin nhạy cảm như PasswordHash ở bảng Users
        var response = new UserProfileResponse
        {
            UserId = user.Id,
            Username = user.Username,
            // Nếu DisplayName chưa được cài đặt (null), lấy Username làm tên hiển thị mặc định
            DisplayName = user.Profile?.DisplayName ?? user.Username, 
            AvatarUrl = user.Profile?.AvatarUrl,
            Bio = user.Profile?.Bio
        };

        return response;
    }

    public async Task<UserUpdateResponse> UpdateUserProfileAsync(int userId, UpdateProfileRequest request)
    {
        // 1. Kiểm tra xem tài khoản này có tồn tại dưới DB hay không
        var existingUser = await _userRepository.GetUserByIdAsync(userId);
        if (existingUser == null)
        {
            return new UserUpdateResponse
            {
                Success = false,
                Message = "Người dùng không tồn tại trong hệ thống."
            };
        }

        // 2. Khởi tạo Entity UserProfile từ dữ liệu Request gửi lên
        var profileToUpdate = new UserProfile
        {
            UserId = userId, // Rất quan trọng: Gắn đúng UserId trích xuất từ Token
            DisplayName = request.DisplayName,
            AvatarUrl = request.AvatarUrl,
            Bio = request.Bio,
            UpdatedAt = DateTime.UtcNow
        };

        // 3. Gọi Repository để thực thi câu lệnh SQL (UPSERT: Update hoặc Insert)
        var isUpdated = await _userRepository.UpdateUserProfileAsync(profileToUpdate);

        if (!isUpdated)
        {
            return new UserUpdateResponse
            {
                Success = false,
                Message = "Đã xảy ra lỗi trong quá trình lưu hồ sơ vào cơ sở dữ liệu."
            };
        }

        return new UserUpdateResponse
        {
            Success = true,
            Message = "Cập nhật thông tin hồ sơ thành công!"
        };
    }
}