using TuneVault.Application.Interfaces;
using TuneVault.Infrastructure.Data;

namespace TuneVault.API;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Add services to the container.
        builder.Services.AddControllers();

        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();

        builder.Services.AddAuthorization();

        builder.Services.AddScoped<IDbConnectionFactory, SqlConnectionFactory>();

        var app = builder.Build();

        // Mở khóa thư mục wwwroot cho phép bên ngoài đọc file
        app.UseStaticFiles();

        app.UseSwagger();
        app.UseSwaggerUI();

        app.UseHttpsRedirection();

        app.UseAuthorization();

        app.MapControllers();

        app.Run();
    }
}