namespace TuneVault.Application.DTOs.Shares;
public record CreateShareRequest(int ReceiverUserId, int MediaItemId, int PlaylistId, string? Message);