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
        // Nâng giới hạn dung lượng request body lên 50MB cho Kestrel Server
        builder.WebHost.ConfigureKestrel(options =>
        {
            options.Limits.MaxRequestBodySize = 52428800; // 50 * 1024 * 1024 bytes
        });
        // Cấu hình CORS cho phép Frontend React truy cập
        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowFrontend", policy =>
            {
                policy.WithOrigins("http://localhost:3000") // URL của Frontend React
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials(); // Bắt buộc phải có để SignalR kết nối được
            });
        });

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
        builder.Services.AddScoped<IHistoryRepository, HistoryRepository>();
        builder.Services.AddScoped<HistoryService>();
        builder.Services.AddScoped<IFavoriteRepository, FavoriteRepository>();
        builder.Services.AddScoped<FavoriteService>();
        builder.Services.AddScoped<IFollowRepository, FollowRepository>();
        builder.Services.AddScoped<FollowService>();
        builder.Services.AddScoped<IPlaylistRepository, PlaylistRepository>();
        builder.Services.AddScoped<PlaylistService>();
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
                // ĐỌC TOKEN CHO SIGNALR 
                options.Events = new Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        var accessToken = context.Request.Query["access_token"];
                        var path = context.Request.Path;

                        // Nếu request gọi vào Hub SignalR và có kèm token trên URL
                        if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs/notifications"))
                        {
                            context.Token = accessToken; // Bơm token vào ngữ cảnh xác thực
                        }
                        return Task.CompletedTask;
                    }
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


        // Kích hoạt CORS (Bắt buộc phải đứng TRƯỚC Authentication và Authorization)
        app.UseCors("AllowFrontend");

        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseHttpsRedirection();

        // Mở thư mục wwwroot để cho phép tải ảnh bìa, nhạc, video trực tiếp qua link static
        app.UseStaticFiles();

        app.UseAuthentication(); 
        app.UseAuthorization();

        app.MapControllers();
        
        // --- Đặt các route của Hub trước ---
        app.MapHub<NotificationHub>("/hubs/notifications");

        app.Run();
    }
}