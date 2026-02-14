using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SecretSantaServer.Migrations
{
    /// <inheritdoc />
    public partial class description_length_updated : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "starts_at",
                table: "games",
                newName: "scheduled_at");

            migrationBuilder.AlterColumn<string>(
                name: "description",
                table: "games",
                type: "character varying(512)",
                maxLength: 512,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(256)",
                oldMaxLength: 256,
                oldNullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "scheduled_at",
                table: "games",
                newName: "starts_at");

            migrationBuilder.AlterColumn<string>(
                name: "description",
                table: "games",
                type: "character varying(256)",
                maxLength: 256,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "character varying(512)",
                oldMaxLength: 512,
                oldNullable: true);
        }
    }
}
