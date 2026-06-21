using TuneVault.Domain.Entities;

namespace TuneVault.Application.Interfaces;

public interface IUserRepository
{
    /// <summary>
    /// Lấy thông tin User theo ID (Bao gồm cả thông tin Profile nếu có)
    /// Sử dụng trong: UserService (Lấy profile, kiểm tra tồn tại)
    /// </summary>
    Task<User?> GetUserByIdAsync(int id);

    /// <summary>
    /// Lấy thông tin User theo Username
    /// Sử dụng trong: AuthService (Kiểm tra trùng lặp khi Đăng ký, xác thực khi Đăng nhập)
    /// </summary>
    Task<User?> GetUserByUsernameAsync(string username);

    /// <summary>
    /// Tạo mới một tài khoản User vào cơ sở dữ liệu
    /// Sử dụng trong: AuthService (Đăng ký)
    /// </summary>
    /// <returns>True nếu insert thành công, False nếu thất bại</returns>
    Task<bool> CreateUserAsync(User user);

    /// <summary>
    /// Cập nhật thông tin hồ sơ (Profile) của User.
    /// Nếu Profile chưa tồn tại thì thực hiện Insert (Upsert)
    /// Sử dụng trong: UserService (Cập nhật hồ sơ)
    /// </summary>
    /// <returns>True nếu update thành công, False nếu thất bại</returns>
    Task<bool> UpdateUserProfileAsync(UserProfile profile);
}