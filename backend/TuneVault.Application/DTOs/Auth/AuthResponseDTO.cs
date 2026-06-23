namespace TuneVault.Application.DTOs.Auth;
public class AuthResponseDTO
{
    public string? Token { get; set; }
    public string? Message { get; set; }
    public bool IsSuccess { get; set; }
}