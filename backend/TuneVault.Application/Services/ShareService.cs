using TuneVault.Application.DTOs.Shares;
using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;
namespace TuneVault.Application.Services;

public class ShareService
{
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
        return await _shareRepo.GetSharedWithMeAsync(currentUserId);
    }

    public async Task<IEnumerable<SharedByMeDto>> GetSharedByMeAsync(int currentUserId)
    {
        return await _shareRepo.GetSharedByMeAsync(currentUserId);
    }

    public async Task<ShareResponse> ShareMediaAsync(int senderId,string senderName,CreateShareRequest request)
    {
        var shareEntity = new MediaShare
        {
            SenderUserId = senderId,
            ReceiverUserId = request.ReceiverUserId,
            // KHÔNG ÉP VỀ 0 NỮA, null thì cứ để nó là null truyền xuống DB
            MediaItemId = request.MediaItemId, 
            PlaylistId = request.PlaylistId, 
            Message = request.Message,
            SharedAt = DateTime.UtcNow
        };

        int newId = await _shareRepo.CreateAsync(shareEntity);
        
        string title = "Bạn có media mới được chia sẻ";
        string message = $"{senderName} đã chia sẻ một {(request.MediaItemId.HasValue ? "bài hát/video" : "playlist")} cho bạn";

        // Lấy ID của cái nào đang có dữ liệu để nhét vào thông báo
        int relatedEntityId = request.MediaItemId ?? request.PlaylistId ?? 0;
        
        await _notificationRepo.CreateNotificationAsync(
            userId: request.ReceiverUserId,
            title: title,
            message: message,
            type: "SHARE_MEDIA",
            relatedId: relatedEntityId
        );
        
        await _notificationHubService.SendNotificationToUserAsync(
            userId: request.ReceiverUserId,
            title: title,
            message: message
        );

        return new ShareResponse(
            newId,
            senderId,
            request.ReceiverUserId,
            // Chỗ này đành phải ép về 0 vì record trả về của ShareResponse đang bắt buộc dùng int. Không ảnh hưởng tới DB.
            request.MediaItemId ?? 0, 
            request.PlaylistId ?? 0, 
            request.Message,
            shareEntity.SharedAt);
    }
}