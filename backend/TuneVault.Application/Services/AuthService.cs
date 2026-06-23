using TuneVault.Application.DTOs.Auth;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Services;

public class AuthService 
{
    // TODO: Inject IUserRepository và IJwtProvider thông qua Constructor sau
    private readonly IUserRepository _userRepository;

    public AuthService(IUserRepository userRepository)
    {
         _userRepository = userRepository;
    }

    public async Task<AuthResponseDTO> LoginAsync(LoginRequestDTO request)
    {
        // TODO: Logic mã hóa password, gọi IUserRepository để tìm User qua Dapper
        // TODO: Sinh JWT Token
        
        // Mô phỏng xử lý bất đồng bộ
        return await Task.FromResult(new AuthResponseDTO 
        { 
            IsSuccess = true, 
            Token = "jwt_token_demo", 
            Message = "Đăng nhập thành công" 
        });
    }

    public async Task<AuthResponseDTO> RegisterAsync(RegisterRequestDTO request)
    {
        // TODO: Kiểm tra User/Email đã tồn tại chưa bằng IUserRepository
        // TODO: Mã hóa password và lưu xuống DB qua Dapper
        
        return await Task.FromResult(new AuthResponseDTO 
        { 
            IsSuccess = true, 
            Message = "Đăng ký thành công" 
        });
    }
}