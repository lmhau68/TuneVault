using TuneVault.Application.Interfaces;
using TuneVault.Infrastructure.Data;
using TuneVault.Infrastructure.Repositories;
using TuneVault.Application.Services;
using TuneVault.Infrastructure.Hubs.Service;
using TuneVault.Infrastructure.Hubs;

namespace TuneVault.API;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Add services to the container.

        builder.Services.AddScoped<IMediaRepository, MediaRepository>();
        builder.Services.AddScoped<MediaService>();

        builder.Services.AddControllers();

        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();

        builder.Services.AddAuthorization();

        builder.Services.AddScoped<IDbConnectionFactory, SqlConnectionFactory>();

        builder.Services.AddScoped<IShareRepository, ShareRepository>();
        builder.Services.AddScoped<ShareService>();
        builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
        builder.Services.AddScoped<NotificationService>();
        builder.Services.AddSignalR();
        builder.Services.AddScoped<INotificationHubService, NotificationHubService>();

        var app = builder.Build();

        app.UseSwagger();
        app.UseSwaggerUI();

        app.UseHttpsRedirection();

        app.UseAuthorization();

        app.MapControllers();

        app.MapHub<NotificationHub>("/hubs/notifications");

        app.Run();
    }
}