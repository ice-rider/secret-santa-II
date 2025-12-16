using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SecretSantaServer.Data;
using SecretSantaServer.Providers;
using SecretSantaServer.Services;
using SecretSantaServer.Utils;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddControllers();

builder.Services.AddScoped<IAccessTokenGenerator, JwtAccessTokenGenerator>();
builder.Services.AddScoped<IAuthService,AuthService>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<IOAuthService,OAuthService>();
builder.Services.AddHttpClient<GoogleOAuthClient>();
builder.Services.AddHttpClient<GithubOAuthClient>();
builder.Services.AddScoped<IAuthService,AuthService>();

var connectionString = builder.Configuration.GetConnectionString("PostgresConnection");
builder.Services.AddDbContext<IDbContext,ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString).UseSnakeCaseNamingConvention()
);

builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(10);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
    options.Cookie.SecurePolicy = CookieSecurePolicy.SameAsRequest;
});

builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,

            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Convert.FromBase64String(builder.Configuration["Jwt:Key"]))
        };
    });
builder.Services.AddAuthorization();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseSession();

app.UseAuthentication();
app.UseAuthorization();

app.UseHttpsRedirection();
app.MapControllers();

app.Run();