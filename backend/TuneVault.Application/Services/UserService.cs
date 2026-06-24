using TuneVault.Application.DTOs.User;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Services;

public class UserService 
{
    // TODO: Sẽ Inject IUserRepository (chứa SQL Dapper) vào đây qua Constructor
    private readonly IUserRepository _userRepository;

    public UserService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<UserResponseDTO> GetProfileAsync(int id)
    {
        // TODO: Gọi IUserRepository.GetByIdAsync(id)
        // TODO: Mapping Entity sang DTO
        
        // Code mô phỏng (Mock) để Controller có thể test trước
        return await Task.FromResult(new UserResponseDTO 
        { 
            Id = id, 
            Username = "audiophile_99", 
            Email = "user@tunevault.com",
            Bio = "Love listening to lo-fi beats."
        });
    }

    public async Task<IEnumerable<UserResponseDTO>> GetAllUsersAsync()
    {
        // TODO: Gọi IUserRepository.GetAllAsync()
        
        var mockList = new List<UserResponseDTO>
        {
            new UserResponseDTO { Id = 1, Username = "admin" },
            new UserResponseDTO { Id = 2, Username = "member" }
        };
        
        return await Task.FromResult(mockList);
    }

    public async Task<bool> UpdateProfileAsync(int id, UpdateProfileRequestDTO request)
    {
        // TODO: Kiểm tra user có tồn tại không bằng IUserRepository
        // TODO: Validate logic nghiệp vụ (nếu có)
        // TODO: Gọi hàm Update của Dapper
        
        return await Task.FromResult(true);
    }
}