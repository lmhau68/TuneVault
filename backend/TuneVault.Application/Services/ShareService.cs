using TuneVault.Application.DTOs.Shares;
using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;
namespace TuneVault.Application.Services;

public class ShareService
{
    // TODO: Xu ly logic nghiep vu cho module Share
    private readonly IShareRepository _shareRepo;
    private readonly INotificationRepository _notificationRepo;
    private readonly INotificationHubService _notificationHubService;

    public ShareService(
        IShareRepository shareRepo,
        INotificationRepository notificationRepo,
        INotificationHubService notificationHubService)
    {
        _shareRepo = shareRepo;
        _notificationRepo = notificationRepo;
        _notificationHubService = notificationHubService;
    }

    public async Task<IEnumerable<SharedWithMeDto>> GetSharedWithMeAsync(int currentUserId)
    {
        // Truyền currentUserId xuống làm ReceiverId
        return await _shareRepo.GetSharedWithMeAsync(currentUserId);
    }

    public async Task<IEnumerable<SharedByMeDto>> GetSharedByMeAsync(int currentUserId)
    {
        // Truyền currentUserId xuống làm SenderId
        return await _shareRepo.GetSharedByMeAsync(currentUserId);
    }

    public async Task<ShareResponse> ShareMediaAsync(int senderId,string senderName,CreateShareRequest request)
    {
        //lưu lượt chia sẻ
        var shareEntity = new MediaShare
        {
            SenderUserId = senderId,
            ReceiverUserId = request.ReceiverUserId,
            MediaItemId = request.MediaItemId,
            PlaylistId=request.PlaylistId,
            Message = request.Message,
            SharedAt = DateTime.UtcNow
        };

        int newId = await _shareRepo.CreateAsync(shareEntity);
        
        //lưu lại thông báo
        string title = "Bạn có media mới được chia sẻ";
        string message = $"{senderName} đã chia sẽ một media cho bạn";

        int relatedEntityId = request.MediaItemId > 0 ? request.MediaItemId : request.PlaylistId;
        await _notificationRepo.CreateNotificationAsync(
            userId: request.ReceiverUserId,
            title: title,
            message: message,
            type: "SHARE_MEDIA",
            relatedId: relatedEntityId
        );
        
        //Gửi bằng signalIr
        await _notificationHubService.SendNotificationToUserAsync(
            userId: request.ReceiverUserId,
            title: title,
            message: message
        );

        return new ShareResponse(
            newId,
            senderId,
            request.ReceiverUserId,
            request.MediaItemId,
            request.PlaylistId,
            request.Message,
            shareEntity.SharedAt);
    }
}
