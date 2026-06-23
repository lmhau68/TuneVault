namespace TuneVault.Application.DTOs.Auth;
public class AuthResultDto
{
    public bool IsSuccess { get; set; }
    public string? Token { get; set; }
    public string Message { get; set; }
    public string? ErrorCode { get; set; } // Dùng để phân loại: "DuplicateEmail", "InvalidCredentials"
}