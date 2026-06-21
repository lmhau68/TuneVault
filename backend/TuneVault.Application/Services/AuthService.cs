using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
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
    private readonly IConfiguration _configuration;

    // Tiêm IUserRepository để thao tác DB và IConfiguration để lấy SecretKey tạo JWT
    public AuthService(IUserRepository userRepository, IConfiguration configuration)
    {
        _userRepository = userRepository;
        _configuration = configuration;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        // 1. Kiểm tra Username đã tồn tại chưa
        var existingUser = await _userRepository.GetUserByUsernameAsync(request.Username);
        if (existingUser != null)
        {
            return new AuthResponse 
            { 
                Success = false, 
                Message = "Tên đăng nhập đã tồn tại trên hệ thống." 
            };
        }

        // 2. Tạo Entity mới và băm mật khẩu
        var newUser = new User
        {
            Username = request.Username,
            Email = request.Email,
            // Yêu cầu cài đặt NuGet package: BCrypt.Net-Next
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password), 
            CreatedAt = DateTime.UtcNow
        };

        // 3. Gọi Repository lưu vào Database
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
        // 1. Tìm user theo username
        var user = await _userRepository.GetUserByUsernameAsync(request.Username);

        // 2. Kiểm tra tồn tại và verify mật khẩu đã băm
        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return new AuthResponse 
            { 
                Success = false, 
                Message = "Tài khoản hoặc mật khẩu không chính xác." 
            };
        }

        // 3. Tạo JWT Token
        var token = GenerateJwtToken(user);

        return new AuthResponse 
        { 
            Success = true, 
            Message = "Đăng nhập thành công!", 
            Token = token 
        };
    }

    // Hàm private hỗ trợ tạo JWT Token
    private string GenerateJwtToken(User user)
    {
        // Lấy config từ appsettings.json, nếu không có thì dùng chuỗi mặc định (chỉ cho dev)
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secretKey = jwtSettings["SecretKey"] ?? "Day_La_Mot_Chuoi_Bi_Mat_Rat_Dai_Cho_JWT_Token_TuneVault";
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        // Các thông tin (Claims) giấu trong Payload của Token
        var claims = new[]
        {
            // BẮT BUỘC: Nhét Id vào NameIdentifier để UsersController có thể trích xuất qua `User.FindFirst(ClaimTypes.NameIdentifier)`
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var token = new JwtSecurityToken(
            issuer: jwtSettings["Issuer"] ?? "TuneVaultAPI",
            audience: jwtSettings["Audience"] ?? "TuneVaultClient",
            claims: claims,
            expires: DateTime.UtcNow.AddHours(2), // Token sống 2 tiếng
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}