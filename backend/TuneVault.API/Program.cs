using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using TuneVault.Application.Interfaces;
using TuneVault.Application.Services;
using TuneVault.Infrastructure.Data;
using TuneVault.Infrastructure.Repositories;

var builder = WebApplication.CreateBuilder(args);

// =========================================================================
// 1. ĐĂNG KÝ DEPENDENCY INJECTION (DI)
// =========================================================================

// Đúng theo class mới của bạn: Bộ DI sẽ tự nạp IConfiguration vào SqlConnectionFactory
builder.Services.AddSingleton<IDbConnectionFactory, SqlConnectionFactory>();
builder.Services.AddScoped<IUserRepository, UserRepository>();

// Đăng ký các tầng xử lý logic nghiệp vụ (Application Services)
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IUserService, UserService>();


// =========================================================================
// 2. CẤU HÌNH HỆ THỐNG XÁC THỰC VÀ PHÂN QUYỀN JWT
// =========================================================================
var jwtKey = builder.Configuration["Jwt:Key"] 
    ?? throw new InvalidOperationException("Cấu hình 'Jwt:Key' không tìm thấy trong hệ thống.");
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

builder.Services.AddAuthorization();


// =========================================================================
// 3. CẤU HÌNH CONTROLLERS VÀ TÀI LIỆU SWAGGER (CÓ TRÌNH NHẬP TOKEN)
// =========================================================================
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo { Title = "TuneVault API", Version = "v1" });
    
    // Tích hợp giao diện nhập Token khóa bảo mật trực tiếp trên trình duyệt
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Nhập mã Token theo định dạng: Bearer {chuỗi_token_jwt}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// =========================================================================
// 4. THIẾT LẬP MIDDLEWARE PIPELINE (QUY TRÌNH XỬ LÝ REQUEST)
// =========================================================================
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// QUY TẮC AN TOÀN: Luôn đặt UseAuthentication() TRƯỚC UseAuthorization()
app.UseAuthentication(); 
app.UseAuthorization();

app.MapControllers();

app.Run();