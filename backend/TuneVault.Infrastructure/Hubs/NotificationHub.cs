namespace TuneVault.Infrastructure.Hubs;


using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.DependencyInjection;
using TuneVault.Application.Interfaces;


[Authorize]
public class NotificationHub : Hub
{
    // Goi ham nay khi ho follow mot creator
    public async Task SubscribeToCreator(int creatorId)
    {
        string groupName = $"followers_of_{creatorId}";
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);
    }


    // Goi ham nay khi ho unfollow mot creator
    public async Task UnsubscribeFromCreator(int creatorId)
    {
        string groupName = $"followers_of_{creatorId}";
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);
    }


    public override async Task OnConnectedAsync()
    {
        // Có thể log ra để debug xem user nào vừa kết nối
        var userId = Context.UserIdentifier;
        Console.WriteLine($"User {userId} connected to NotificationHub.");

        await base.OnConnectedAsync();
    }
}