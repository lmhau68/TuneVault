using TuneVault.Application.DTOs.Notifications;
using TuneVault.Application.Interfaces;
using Dapper;
namespace TuneVault.Infrastructure.Repositories;

public class NotificationRepository : INotificationRepository
{
    // TODO: Viet SQL Dapper cho NotificationRepository
    // D�ng IDbConnectionFactory de mo ket noi database
    private readonly IDbConnectionFactory _connFactory;

    public NotificationRepository(IDbConnectionFactory connFactory)
    {
        _connFactory = connFactory;
    }

    public async Task<IEnumerable<NotificationDto>> GetMyNotificationsAsync(int userId)
    {
        // Viết câu lệnh SQL thuần map chính xác với tên cột đã sửa đổi
        string sql = @"
            SELECT Id, UserId, Title, Message, NotificationType, RelatedEntityId, IsRead, CreatedAt 
            FROM Notifications 
            WHERE UserId = @UserId 
            ORDER BY CreatedAt DESC;";

        using (var conn = _connFactory.CreateConnection())
        {
            return await conn.QueryAsync<NotificationDto>(sql, new { UserId = userId });
        }
    }

    public async Task<bool> MarkAsReadAsync(int id, int userId)
    {
        // Ràng buộc thêm UserId để chắc chắn người dùng không can thiệp được thông báo của người khác
        string sql = @"
            UPDATE Notifications 
            SET IsRead = 1 
            WHERE Id = @Id AND UserId = @UserId;";

        using (var conn = _connFactory.CreateConnection())
        {
            var rowsAffected = await conn.ExecuteAsync(sql, new { Id = id, UserId = userId });
            return rowsAffected > 0;
        }
    }

    public async Task<bool> CreateNotificationAsync(int userId, string title, string message, string type, int relatedId)
    {
        string sql = @"
            INSERT INTO Notifications (UserId, Title, Message, NotificationType, RelatedEntityId, IsRead, CreatedAt)
            VALUES (@UserId, @Title, @Message, @NotificationType, @RelatedId, 0, GETDATE());";

        using (var conn = _connFactory.CreateConnection())
        {
            var rowsAffected = await conn.ExecuteAsync(sql, new
            {
                UserId = userId,
                Title = title,
                Message = message,
                NotificationType = type,
                RelatedId = relatedId
            });

            return rowsAffected > 0;
        }
    }
}
