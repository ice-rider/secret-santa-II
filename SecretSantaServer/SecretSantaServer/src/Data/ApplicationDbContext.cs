using Microsoft.EntityFrameworkCore;
using SecretSantaServer.Models;

namespace SecretSantaServer.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : DbContext(options)
{
    public DbSet<User> Users { get; set; }
    public DbSet<Game> Games { get; set; }
    public DbSet<GameMember> GameMembers { get; set; }
    public DbSet<Assignment> Assignments { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(user =>
        {
            user.HasKey(x => x.Id);

            user.Property(x => x.Name).IsRequired().HasMaxLength(32);
        });
        modelBuilder.Entity<Game>(game =>
        {
            game.HasKey(x => x.Id);

            game.Property(x => x.Title).IsRequired().HasMaxLength(32);
            game.Property(x => x.Description).HasMaxLength(256);
            game.HasIndex(x => x.Code).IsUnique();

            game.HasOne(x => x.Admin)
                .WithOne()
                .HasForeignKey<Game>(x => x.AdminId)
                .OnDelete(DeleteBehavior.Cascade);
        });
        modelBuilder.Entity<GameMember>(gameMember =>
        {
            gameMember.HasKey(x => x.Id);

            gameMember.Property(x => x.Letter).HasMaxLength(256);

            gameMember.HasIndex(x => new { x.GameId, x.UserId }).IsUnique();

            gameMember.HasOne(x => x.Game)
                .WithMany(x => x.GameMembers)
                .HasForeignKey(x => x.GameId)
                .OnDelete(DeleteBehavior.Cascade);

            gameMember.HasOne(x => x.User)
                .WithMany(x => x.GameMembers)
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        });
        modelBuilder.Entity<Assignment>(assignment =>
        {
            assignment.HasKey(x => x.RecipientId);

            assignment.HasIndex(x => new { x.GameId, x.SantaId }).IsUnique();

            assignment.HasOne(x => x.Recipient)
                .WithMany()
                .HasForeignKey(x => x.RecipientId)
                .OnDelete(DeleteBehavior.Cascade);

            assignment.HasOne(x => x.Game)
                .WithMany()
                .HasForeignKey(x => x.GameId)
                .OnDelete(DeleteBehavior.Cascade);

            assignment.HasOne(x => x.Santa)
                .WithMany()
                .HasForeignKey(x => x.SantaId)
                .OnDelete(DeleteBehavior.SetNull);
        });
        modelBuilder.Entity<UserCredentials>(userAuthData =>
        {
            userAuthData.HasKey(x => x.UserId);
            
            userAuthData.HasIndex(x => x.Email).IsUnique();
            userAuthData.HasIndex(x => x.GithubId).IsUnique();
            userAuthData.HasIndex(x => x.GoogleId).IsUnique();
            userAuthData.HasIndex(x => x.TelegramId).IsUnique();

            userAuthData.HasOne(x => x.User)
                .WithOne(x => x.Credential)
                .HasForeignKey<UserCredentials>(x => x.UserId);
        });
    }
}