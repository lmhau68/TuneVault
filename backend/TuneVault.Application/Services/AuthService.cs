using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using TuneVault.Application.DTOs.Auth;
using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;
using BCryptNet = BCrypt.Net.BCrypt;

namespace TuneVault.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IConfiguration _configuration;

    public AuthService(IUserRepository userRepository, IConfiguration configuration)
    {
        _userRepository = userRepository;
        _configuration = configuration;
    }

    public async Task<AuthResultDto> RegisterAsync(RegisterRequestDTO request)
    {
        // 1. Kiểm tra trùng lặp email thông qua Dapper query của Repository
        var existingUser = await _userRepository.GetByEmailAsync(request.Email);
        if (existingUser != null)
        {
            return new AuthResultDto
            {
                IsSuccess = false,
                Message = "Email này đã được đăng ký sử dụng trong hệ thống.",
                ErrorCode = "DuplicateEmail"
            };
        }

        // 2. Sử dụng BCrypt hash mật khẩu an toàn trước khi lưu
        var passwordHash = BCryptNet.HashPassword(request.Password);

        var newUser = new User
        {
            Email = request.Email,
            PasswordHash = passwordHash,
            DisplayName = request.DisplayName
        };

        // 3. Gọi repository lưu xuống cơ sở dữ liệu thông qua câu lệnh INSERT Dapper
        await _userRepository.CreateAsync(newUser);

        return new AuthResultDto
        {
            IsSuccess = true,
            Message = "Đăng ký tài khoản thành công."
        };
    }

    public async Task<AuthResultDto> LoginAsync(LoginRequestDTO request)
    {
        // 1. Tìm kiếm User theo Email
        var user = await _userRepository.GetByEmailAsync(request.Email);
        if (user == null)
        {
            return new AuthResultDto
            {
                IsSuccess = false,
                Message = "Tài khoản hoặc mật khẩu không chính xác.",
                ErrorCode = "InvalidCredentials"
            };
        }

        // 2. Xác thực chuỗi Hash mật khẩu bằng mã BCrypt
        var isPasswordValid = BCryptNet.Verify(request.Password, user.PasswordHash);
        if (!isPasswordValid)
        {
            return new AuthResultDto
            {
                IsSuccess = false,
                Message = "Tài khoản hoặc mật khẩu không chính xác.",
                ErrorCode = "InvalidCredentials"
            };
        }

        // 3. Khởi tạo Token hợp lệ thời hạn 1 giờ
        var token = GenerateJwtToken(user);

        return new AuthResultDto
        {
            IsSuccess = true,
            Token = token,
            Message = "Đăng nhập thành công."
        };
    }

    private string GenerateJwtToken(User user)
    {
        var jwtKey = _configuration["Jwt:Key"] ?? throw new InvalidOperationException("Thiếu cấu hình Jwt:Key.");
        var issuer = _configuration["Jwt:Issuer"];
        var audience = _configuration["Jwt:Audience"];

        var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        // ĐẢM BẢO TUYỆT ĐỐI: Nhét ID dạng số nguyên (user.Id.ToString()) vào ClaimTypes.NameIdentifier
        // Điều này giúp hàm int.Parse(...) bên phía MediaController hoạt động chính xác
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.DisplayName)
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(1), // Thời hạn sử dụng đúng 1 tiếng
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}