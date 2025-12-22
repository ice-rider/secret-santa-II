using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace SecretSantaServer.Migrations
{
    /// <inheritdoc />
    public partial class auth : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "ix_users_email",
                table: "users");

            migrationBuilder.DropIndex(
                name: "ix_users_github_id",
                table: "users");

            migrationBuilder.DropIndex(
                name: "ix_users_google_id",
                table: "users");

            migrationBuilder.DropIndex(
                name: "ix_users_telegram_id",
                table: "users");

            migrationBuilder.DropColumn(
                name: "email",
                table: "users");

            migrationBuilder.DropColumn(
                name: "github_id",
                table: "users");

            migrationBuilder.DropColumn(
                name: "google_id",
                table: "users");

            migrationBuilder.DropColumn(
                name: "password_hash",
                table: "users");

            migrationBuilder.DropColumn(
                name: "telegram_id",
                table: "users");

            migrationBuilder.CreateTable(
                name: "refresh_tokens",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    token = table.Column<string>(type: "text", nullable: false),
                    user_id = table.Column<int>(type: "integer", nullable: false),
                    expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_refresh_tokens", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "user_auth_data",
                columns: table => new
                {
                    user_id = table.Column<int>(type: "integer", nullable: false),
                    email = table.Column<string>(type: "text", nullable: true),
                    password_hash = table.Column<string>(type: "text", nullable: true),
                    google_id = table.Column<string>(type: "text", nullable: true),
                    github_id = table.Column<string>(type: "text", nullable: true),
                    telegram_id = table.Column<long>(type: "bigint", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_user_auth_data", x => x.user_id);
                    table.ForeignKey(
                        name: "fk_user_auth_data_users_user_id",
                        column: x => x.user_id,
                        principalTable: "users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "ix_refresh_tokens_token",
                table: "refresh_tokens",
                column: "token",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_user_auth_data_email",
                table: "user_auth_data",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_user_auth_data_github_id",
                table: "user_auth_data",
                column: "github_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_user_auth_data_google_id",
                table: "user_auth_data",
                column: "google_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_user_auth_data_telegram_id",
                table: "user_auth_data",
                column: "telegram_id",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "refresh_tokens");

            migrationBuilder.DropTable(
                name: "user_auth_data");

            migrationBuilder.AddColumn<string>(
                name: "email",
                table: "users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "github_id",
                table: "users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "google_id",
                table: "users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "password_hash",
                table: "users",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "telegram_id",
                table: "users",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "ix_users_email",
                table: "users",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_users_github_id",
                table: "users",
                column: "github_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_users_google_id",
                table: "users",
                column: "google_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_users_telegram_id",
                table: "users",
                column: "telegram_id",
                unique: true);
        }
    }
}
