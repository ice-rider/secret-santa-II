using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace SecretSantaServer.Migrations
{
    /// <inheritdoc />
    public partial class remove_refresh_key : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "refresh_tokens");

            migrationBuilder.DropPrimaryKey(
                name: "pk_assignments",
                table: "assignments");

            migrationBuilder.DropIndex(
                name: "ix_assignments_game_id_santa_id",
                table: "assignments");

            migrationBuilder.AlterColumn<int>(
                name: "santa_id",
                table: "assignments",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddPrimaryKey(
                name: "pk_assignments",
                table: "assignments",
                columns: new[] { "game_id", "recipient_id", "santa_id" });

            migrationBuilder.CreateIndex(
                name: "ix_assignments_recipient_id",
                table: "assignments",
                column: "recipient_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "pk_assignments",
                table: "assignments");

            migrationBuilder.DropIndex(
                name: "ix_assignments_recipient_id",
                table: "assignments");

            migrationBuilder.AlterColumn<int>(
                name: "santa_id",
                table: "assignments",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddPrimaryKey(
                name: "pk_assignments",
                table: "assignments",
                column: "recipient_id");

            migrationBuilder.CreateTable(
                name: "refresh_tokens",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    expires_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    token = table.Column<string>(type: "text", nullable: false),
                    user_id = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_refresh_tokens", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "ix_assignments_game_id_santa_id",
                table: "assignments",
                columns: new[] { "game_id", "santa_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "ix_refresh_tokens_token",
                table: "refresh_tokens",
                column: "token",
                unique: true);
        }
    }
}
