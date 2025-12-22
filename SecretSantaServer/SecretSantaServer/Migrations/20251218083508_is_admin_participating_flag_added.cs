using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SecretSantaServer.Migrations
{
    /// <inheritdoc />
    public partial class is_admin_participating_flag_added : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "is_admin_participating",
                table: "games",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "is_admin_participating",
                table: "games");
        }
    }
}
