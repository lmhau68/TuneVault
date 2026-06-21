using TuneVault.Application.DTOs.Auth;
using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Services;

// (Nên đặt IAuthService ở chung file này hoặc tách ra file IAuthService.cs trong thư mục Services)
public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
}

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    // TODO: Thực tế sẽ cần tiêm thêm ITokenService (để tạo JWT) và IPasswordHasher (để băm mật khẩu)

    // Áp dụng Dependency Injection (DI)
    public AuthService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        // 1. Gọi DB kiểm tra xem Username đã tồn tại chưa
        var existingUser = await _userRepository.GetUserByUsernameAsync(request.Username);
        if (existingUser != null)
        {
            return new AuthResponse 
            { 
                Success = false, 
                Message = "Tên đăng nhập đã tồn tại trên hệ thống." 
            };
        }

        // 2. Khởi tạo Entity từ DTO đầu vào (Dùng var)
        var newUser = new User
        {
            Username = request.Username,
            Email = request.Email,
            // LƯU Ý: Tuyệt đối không lưu plain text ở môi trường production.
            // Cần sử dụng thư viện như BCrypt.Net-Next để hash: BCrypt.Net.BCrypt.HashPassword(request.Password)
            PasswordHash = request.Password, 
            CreatedAt = DateTime.UtcNow
        };

        // 3. Gọi Repository để thực thi câu lệnh SQL INSERT
        var isCreated = await _userRepository.CreateUserAsync(newUser);

        if (!isCreated)
        {
            return new AuthResponse 
            { 
                Success = false, 
                Message = "Đã xảy ra lỗi khi tạo tài khoản vào cơ sở dữ liệu." 
            };
        }

        return new AuthResponse 
        { 
            Success = true, 
            Message = "Đăng ký tài khoản thành công!" 
        };
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        // 1. Truy xuất thông tin người dùng từ DB
        var user = await _userRepository.GetUserByUsernameAsync(request.Username);

        // 2. Kiểm tra User tồn tại và validate Password
        // LƯU Ý: Nếu dùng BCrypt, logic sẽ là: BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash)
        if (user == null || user.PasswordHash != request.Password) 
        {
            return new AuthResponse 
            { 
                Success = false, 
                Message = "Tài khoản hoặc mật khẩu không chính xác." 
            };
        }

        // 3. Xử lý tạo Token (JWT)
        // TODO: Logic này nên được tách ra một interface ITokenService.GenerateToken(user)
        var simulatedJwtToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy.token"; 

        return new AuthResponse 
        { 
            Success = true, 
            Message = "Đăng nhập thành công!", 
            Token = simulatedJwtToken 
        };
    }
}