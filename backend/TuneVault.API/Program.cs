using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using TuneVault.Application.Interfaces;
using TuneVault.Application.Services;
using TuneVault.Infrastructure.Data;
using TuneVault.Infrastructure.Repositories;
using TuneVault.Application.AI;
using TuneVault.Infrastructure.AI;
using MediatR;
using TuneVault.Infrastructure.Hubs;        
using TuneVault.Infrastructure.Hubs.Service; 

namespace TuneVault;
public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // 1. DEPENDENCY INJECTION (Gộp của cả main và AI)
        builder.Services.AddSingleton<IDbConnectionFactory, SqlConnectionFactory>();
        
        // Repositories & Services - DEPENDENCY INJECTION
        builder.Services.AddScoped<IUserRepository, UserRepository>();
        builder.Services.AddScoped<AuthService>();
        builder.Services.AddScoped<UserService>();
        builder.Services.AddScoped<IShareRepository, ShareRepository>();
        builder.Services.AddScoped<ShareService>();
        builder.Services.AddScoped<INotificationRepository, NotificationRepository>();
        builder.Services.AddScoped<NotificationService>();
        builder.Services.AddScoped<IMediaRepository, MediaRepository>();
        builder.Services.AddScoped<MediaService>();
        
        // Của riêng AI
        builder.Services.AddScoped<IHistoryRepository, HistoryRepository>();
        builder.Services.AddScoped<IFavoriteRepository, FavoriteRepository>();
        
        // SignalR
        builder.Services.AddSignalR();
        builder.Services.AddScoped<INotificationHubService, NotificationHubService>();

        // Đăng ký MediatR cho AI
        builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(GetRecommendationsHandler).Assembly));
        
        // Đăng ký GeminiService
        builder.Services.Configure<GeminiOptions>(builder.Configuration.GetSection("Gemini"));
        builder.Services.AddHttpClient<IGeminiService, GeminiService>();

        // 2. JWT AUTHENTICATION
        var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new InvalidOperationException("Missing Jwt:Key");
        var jwtIssuer = builder.Configuration["Jwt:Issuer"];
        var jwtAudience = builder.Configuration["Jwt:Audience"];

        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtIssuer,
                    ValidAudience = jwtAudience,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
                };
            });
        
        builder.Services.AddAuthorization(); // Thêm cái này của ông

        // 3. CONTROLLERS & SWAGGER
        builder.Services.AddControllers();
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new OpenApiInfo 
            { 
                Title = "TuneVault API", 
                Version = "v1" 
            });

            options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Description = "Nhập mã Token theo định dạng: Bearer {token}",
                Name = "Authorization",
                In = ParameterLocation.Header,
                Type = SecuritySchemeType.Http,
                Scheme = "Bearer"
            });

            options.AddSecurityRequirement(document => new OpenApiSecurityRequirement
                {
                    [new OpenApiSecuritySchemeReference("Bearer", document)] = []
                });
            });
        var app = builder.Build();

        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseHttpsRedirection();
        app.UseStaticFiles();

        app.UseAuthentication(); 
        app.UseAuthorization();

        app.MapControllers();
        
        // --- Đặt các route của Hub trước ---
        app.MapHub<NotificationHub>("/hubs/notifications");

        app.Run();
    }
}