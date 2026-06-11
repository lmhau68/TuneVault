using System.Threading.Tasks;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Interfaces;
public interface IShareRepository
{
    // TODO: Khai bao cac method cho ShareRepository
    Task<int> CreateAsync(MediaShare media);//Tạo lượt Share mới
    Task<IEnumerable<SharedWithMeDto>> GetSharedWithMeAsync(int receiverId);//Lấy danh sách ShareWithMe
    Task<IEnumerable<SharedByMeDto>> GetSharedByMeAsync(int senderId);//Lấy danh sách ShareByMe
    
}
