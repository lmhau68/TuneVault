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

public class AuthService
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
        // Sử dụng câu lệnh Dapper qua Repository để kiểm tra trùng lặp Email
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

        // Ứng dụng BCrypt để băm mật khẩu an toàn
        var passwordHash = BCryptNet.HashPassword(request.Password);

        var newUser = new User
        {
            Email = request.Email,
            PasswordHash = passwordHash,
            DisplayName = request.DisplayName
        };

        // Lưu thông tin xuống cơ sở dữ liệu qua lệnh INSERT Dapper
        await _userRepository.CreateAsync(newUser);

        return new AuthResultDto
        {
            IsSuccess = true,
            Message = "Đăng ký tài khoản thành công."
        };
    }

    public async Task<AuthResultDto> LoginAsync(LoginRequestDTO request)
    {
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

        // Xác thực chuỗi mật khẩu mã hóa
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

        // Khởi tạo mã Token thời hạn đúng 1 tiếng
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

        // ĐÁP ỨNG ĐÚNG TIÊU CHUẨN: Ép kiểu Số Nguyên (user.Id.ToString()) vào ClaimTypes.NameIdentifier
        // Giúp MediaController chạy hàm int.Parse(...) trơn tru không sập lỗi Format
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
            expires: DateTime.UtcNow.AddHours(1),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}