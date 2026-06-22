using TuneVault.Application.Interfaces;
using TuneVault.Application.Services;
using TuneVault.Infrastructure.Data;
using TuneVault.Infrastructure.Repositories;

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

        var app = builder.Build();

        app.UseSwagger();
        app.UseSwaggerUI();

        app.UseHttpsRedirection();

        app.UseAuthorization();

        app.MapControllers();

        app.Run();
    }
}