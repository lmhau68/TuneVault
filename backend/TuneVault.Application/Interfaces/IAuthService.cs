using TuneVault.Application.DTOs.Auth;

namespace TuneVault.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResultDto> RegisterAsync(RegisterRequestDTO request);
    Task<AuthResultDto> LoginAsync(LoginRequestDTO request);
}