using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;
namespace TuneVault.Application.Services;

public class ShareService
{
    // TODO: Xu ly logic nghiep vu cho module Share
    private readonly IShareRepository _shareRepo;

    public ShareService(IShareRepository shareRepo)
    {
        _shareRepo = shareRepo;
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

    public async Task<ShareResponse> ShareMediaAsync(int senderId,CreateShareRequest request)
    {
        var shareEntity = new MediaShare
        {
            SenderUserId = senderId,
            ReceiverUserId = request.ReceiverUserId,
            MediaItemId = request.MediaItemId,
            Message = request.Message,
            SharedAt = DateTime.UtcNow
        };

        int newId = await _shareRepo.CreateAsync(shareEntity);

        return new ShareResponse(newId,senderId,request.ReceiverUserId,request.MediaItemId,request.Message,shareEntity.SharedAt);
    }
}
