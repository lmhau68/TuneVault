using TuneVault.Application.DTOs.User;
using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities; // Thêm dòng này để gọi được UserProfile

namespace TuneVault.Application.Services;

public class UserService 
{
    private readonly IUserRepository _userRepository;

    public UserService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<UserResponseDTO?> GetProfileAsync(int id)
    {
        // 1. Gọi Repo chọc xuống Database lấy dữ liệu THẬT
        var user = await _userRepository.GetByIdAsync(id);
        
        // 2. Nếu không có ai thì trả về null cho Controller xử lý báo lỗi
        if (user == null) return null;

        // 3. Chuyển đổi (Map) từ Thực thể (Entity) sang định dạng trả về (DTO)
        return new UserResponseDTO 
        { 
            Id = user.Id, 
            Username = user.DisplayName, // Lấy DisplayName làm Username
            FullName = user.Profile?.FullName,
            Email = user.Email,
            Bio = user.Profile?.Bio,     // Dùng dấu ? vì có thể user chưa có Profile
            AvatarUrl = user.Profile?.AvatarUrl
        };
    }

    public async Task<IEnumerable<UserResponseDTO>> GetAllUsersAsync()
    {
        // 1. Lấy toàn bộ danh sách user từ Database
        var users = await _userRepository.GetAllUsersAsync();
        
        // 2. Map sang list DTO
        return users.Select(u => new UserResponseDTO 
        { 
            Id = u.Id, 
            Username = u.DisplayName,
            Email = u.Email
        }).ToList();
    }

    public async Task<bool> UpdateProfileAsync(int id, UpdateProfileRequestDTO request)
    {
        // 1. Kiểm tra xem user có tồn tại không trước khi update
        var existingUser = await _userRepository.GetByIdAsync(id);
        if (existingUser == null) return false;

        // 2. Gói dữ liệu từ Request vào Entity UserProfile
        var profile = new UserProfile
        {
            FullName = request.FullName, 
            Bio = request.Bio,
            AvatarUrl = request.AvatarUrl
        };

        // 3. Gọi hàm Upsert (Cập nhật hoặc Thêm mới) của Dapper
        return await _userRepository.UpdateProfileAsync(id, profile);
    }
}