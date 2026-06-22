using System;
using System.Security.Authentication;
using System.Threading.Tasks;
using TuneVault.API.DTOs; // Giữ namespace DTO đồng bộ với API hoặc thay đổi tùy dự án

namespace TuneVault.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IUserProfileRepository _profileRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtProvider _jwtProvider;

    // Toàn bộ các mối quan hệ phụ thuộc đều được Tiêm (Dependency Injection) qua Constructor
    public AuthService(
        IUserRepository userRepository,
        IUserProfileRepository profileRepository,
        IPasswordHasher passwordHasher,
        IJwtProvider jwtProvider)
    {
        _userRepository = userRepository;
        _profileRepository = profileRepository;
        _passwordHasher = passwordHasher;
        _jwtProvider = jwtProvider;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto registerDto)
    {
        // 1. Logic nghiệp vụ: Kiểm tra trùng lặp email trước khi đăng ký
        var existingUser = await _userRepository.GetByEmailAsync(registerDto.Email);
        if (existingUser != null)
        {
            throw new InvalidOperationException("Email này đã được sử dụng trong hệ thống.");
        }

        // 2. Logic nghiệp vụ: Mã hóa mật khẩu bảo mật trước khi lưu DB
        var hashedPassword = _passwordHasher.HashPassword(registerDto.Password);

        // 3. Khởi tạo đối tượng User (Tận dụng var vì kiểu khởi tạo đã tường minh)
        var newUser = new User
        {
            Email = registerDto.Email,
            PasswordHash = hashedPassword,
            DisplayName = registerDto.Username, // Map thuộc tính Username từ DTO sang DisplayName của DB
            CreatedAt = DateTime.UtcNow
        };

        // 4. Gọi Repository để lưu tài khoản vào bảng Users
        var userId = await _userRepository.CreateAsync(newUser);
        newUser.Id = userId;

        // 5. Logic nghiệp vụ nâng cao: Tự động khởi tạo bản ghi thông tin Hồ sơ trống ở bảng UserProfiles
        var newProfile = new UserProfile
        {
            UserId = userId,
            FullName = registerDto.Username, // Tạm thời lấy tên đăng nhập làm FullName ban đầu
            CreatedAt = DateTime.UtcNow
        };
        await _profileRepository.CreateAsync(newProfile);

        // 6. Tạo JWT Token cho phiên đăng nhập đầu tiên
        var token = _jwtProvider.GenerateToken(newUser);

        return new AuthResponseDto
        {
            Token = token,
            Username = newUser.DisplayName,
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        };
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto loginDto)
    {
        // 1. Logic nghiệp vụ: Tìm kiếm người dùng dựa trên Email/Username truyền lên
        var user = await _userRepository.GetByEmailAsync(loginDto.UsernameOrEmail);
        if (user == null)
        {
            throw new InvalidCredentialException("Tài khoản hoặc mật khẩu không chính xác.");
        }

        // 2. Logic nghiệp vụ: Đối chiếu và kiểm tra tính hợp lệ của mật khẩu mã hóa
        var isPasswordValid = _passwordHasher.VerifyPassword(loginDto.Password, user.PasswordHash);
        if (!isPasswordValid)
        {
            throw new InvalidCredentialException("Tài khoản hoặc mật khẩu không chính xác.");
        }

        // 3. Khởi tạo Token khi xác thực thành công
        var token = _jwtProvider.GenerateToken(user);

        return new AuthResponseDto
        {
            Token = token,
            Username = user.DisplayName,
            ExpiresAt = DateTime.UtcNow.AddDays(7)
        };
    }
}