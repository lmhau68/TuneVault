using TuneVault.Domain.Entities;

namespace TuneVault.Application.Interfaces;

public interface IUserRepository
{
    /// <summary>
    /// Lấy thông tin User kèm theo UserProfile (nếu có) dựa vào Id.
    /// </summary>
    Task<User?> GetByIdAsync(int id);

    /// <summary>
    /// Lấy thông tin User dựa vào Email (thường dùng cho đăng nhập hoặc kiểm tra tồn tại).
    /// </summary>
    Task<User?> GetByEmailAsync(string email);

    /// <summary>
    /// Tạo tài khoản User mới và trả về Id vừa được tạo.
    /// </summary>
    Task<int> CreateAsync(User user);

    /// <summary>
    /// Cập nhật (hoặc thêm mới) thông tin hồ sơ của User.
    /// </summary>
    Task<bool> UpdateProfileAsync(int userId, UserProfile profile);

    /// <summary>
    /// Lấy danh sách toàn bộ Users trong hệ thống (sắp xếp theo ngày tạo mới nhất).
    /// </summary>
    Task<IEnumerable<User>> GetAllUsersAsync();
}