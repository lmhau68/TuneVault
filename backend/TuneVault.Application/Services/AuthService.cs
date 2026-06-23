using TuneVault.Application.DTOs.Auth;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Services;

public class AuthService : IAuthService
{
    // TODO: Inject IUserRepository và IJwtProvider thông qua Constructor sau
    public AuthService()
    {
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request)
    {
        // TODO: Logic mã hóa password, gọi IUserRepository để tìm User qua Dapper
        // TODO: Sinh JWT Token
        
        // Mô phỏng xử lý bất đồng bộ
        return await Task.FromResult(new AuthResponseDto 
        { 
            IsSuccess = true, 
            Token = "jwt_token_demo", 
            Message = "Đăng nhập thành công" 
        });
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request)
    {
        // TODO: Kiểm tra User/Email đã tồn tại chưa bằng IUserRepository
        // TODO: Mã hóa password và lưu xuống DB qua Dapper
        
        return await Task.FromResult(new AuthResponseDto 
        { 
            IsSuccess = true, 
            Message = "Đăng ký thành công" 
        });
    }
}