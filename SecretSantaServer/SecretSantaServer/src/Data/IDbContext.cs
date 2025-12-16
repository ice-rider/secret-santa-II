using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using SecretSantaServer.Models;

namespace SecretSantaServer.Data;

public interface IDbContext
{
    DbSet<User> Users { get; set; }
    DbSet<UserCredentials> Credentials { get; set; }
    DbSet<Game> Games { get; set; }
    DbSet<GameMember> GameMembers { get; set; }
    DbSet<Assignment> Assignments { get; set; }
    DbSet<RefreshToken> RefreshTokens { get; set; }
    Task<IDbContextTransaction> BeginTransactionAsync(CancellationToken cancellationToken = default);
    Task CommitTransactionAsync(IDbContextTransaction transaction, CancellationToken cancellationToken = default);
    Task RollbackTransactionAsync(IDbContextTransaction transaction, CancellationToken cancellationToken = default);


    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}