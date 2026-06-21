namespace TuneVault.Application.Services;

// (Nên đặt IAuthService ở chung file này hoặc tách ra file IAuthService.cs trong thư mục Services)
public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request);
    Task<AuthResponse> LoginAsync(LoginRequest request);
}

public class AuthService : IAuthService
{
    // TODO: Xu ly logic nghiep vu cho Auth
}
