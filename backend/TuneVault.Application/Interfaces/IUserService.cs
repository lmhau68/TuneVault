using TuneVault.Application.DTOs.User;

namespace TuneVault.Application.Interfaces;

public interface IUserService
{
    Task<UserResponseDto> GetProfileAsync(int id);
    Task<IEnumerable<UserResponseDto>> GetAllUsersAsync();
    Task<bool> UpdateProfileAsync(int id, UpdateProfileRequestDto request);
}