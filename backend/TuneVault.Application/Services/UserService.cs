using TuneVault.Application.DTOs.User;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Services;

public class UserService : IUserService
{
    // TODO: Sẽ Inject IUserRepository (chứa SQL Dapper) vào đây qua Constructor
    public UserService()
    {
    }

    public async Task<UserResponseDto> GetProfileAsync(int id)
    {
        // TODO: Gọi IUserRepository.GetByIdAsync(id)
        // TODO: Mapping Entity sang DTO
        
        // Code mô phỏng (Mock) để Controller có thể test trước
        return await Task.FromResult(new UserResponseDto 
        { 
            Id = id, 
            Username = "audiophile_99", 
            Email = "user@tunevault.com",
            Bio = "Love listening to lo-fi beats."
        });
    }

    public async Task<IEnumerable<UserResponseDto>> GetAllUsersAsync()
    {
        // TODO: Gọi IUserRepository.GetAllAsync()
        
        var mockList = new List<UserResponseDto>
        {
            new UserResponseDto { Id = 1, Username = "admin" },
            new UserResponseDto { Id = 2, Username = "member" }
        };
        
        return await Task.FromResult(mockList);
    }

    public async Task<bool> UpdateProfileAsync(int id, UpdateProfileRequestDto request)
    {
        // TODO: Kiểm tra user có tồn tại không bằng IUserRepository
        // TODO: Validate logic nghiệp vụ (nếu có)
        // TODO: Gọi hàm Update của Dapper
        
        return await Task.FromResult(true);
    }
}