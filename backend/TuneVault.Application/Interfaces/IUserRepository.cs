using System.Collections.Generic;
using System.Threading.Tasks;
using TuneVault.Domain.Entities; // Giả định đây là nơi bạn định nghĩa thực thể User từ Database Schema

namespace TuneVault.Application.Interfaces;

public interface IUserRepository
{
    /// <summary>
    /// Tìm kiếm người dùng bằng ID (Phục vụ hiển thị thông tin chi tiết và kiểm tra quyền)
    /// </summary>
    Task<User?> GetByIdAsync(int id);

    /// <summary>
    /// Tìm kiếm người dùng qua Email (Phục vụ luồng Đăng nhập và kiểm tra trùng lặp khi Đăng ký)
    /// </summary>
    Task<User?> GetByEmailAsync(string email);

    /// <summary>
    /// Thêm mới một tài khoản vào hệ thống (Phục vụ luồng Đăng ký)
    /// </summary>
    /// <returns>Trả về Id tự tăng (IDENTITY) vừa được sinh ra trong Database</returns>
    Task<int> CreateAsync(User user);

    /// <summary>
    /// Cập nhật thông tin cơ bản của tài khoản (Email, DisplayName,...)
    /// </summary>
    /// <returns>Trả về true nếu cập nhật thành công</returns>
    Task<bool> UpdateAsync(User user);

    /// <summary>
    /// Tìm kiếm danh sách người dùng theo tên hiển thị (Phục vụ tính năng tìm kiếm User/Artist trên TuneVault)
    /// </summary>
    Task<IEnumerable<User>> SearchByDisplayNameAsync(string query);

    /// <summary>
    /// Xóa tài khoản khỏi hệ thống (Hỗ trợ ON DELETE CASCADE tự động dọn sạch dữ liệu liên quan ở bảng khác)
    /// </summary>
    Task<bool> DeleteAsync(int id);
}