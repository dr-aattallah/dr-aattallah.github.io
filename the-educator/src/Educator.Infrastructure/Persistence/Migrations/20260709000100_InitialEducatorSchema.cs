using System;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Educator.Infrastructure.Persistence.Migrations;

[DbContext(typeof(EducatorDbContext))]
[Migration("20260709000100_InitialEducatorSchema")]
public partial class InitialEducatorSchema : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "users",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                name = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                email = table.Column<string>(type: "character varying(320)", maxLength: 320, nullable: false),
                role = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                university_id = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                profile_image_path = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                status = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_users", x => x.id);
            });

        migrationBuilder.CreateTable(
            name: "courses",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                course_code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                title = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                semester = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                section = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                instructor_id = table.Column<Guid>(type: "uuid", nullable: false),
                visibility = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_courses", x => x.id);
                table.ForeignKey(
                    name: "fk_courses_users_instructor_id",
                    column: x => x.instructor_id,
                    principalTable: "users",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateTable(
            name: "enrollments",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                course_id = table.Column<Guid>(type: "uuid", nullable: false),
                student_id = table.Column<Guid>(type: "uuid", nullable: false),
                status = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                section = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_enrollments", x => x.id);
                table.ForeignKey(
                    name: "fk_enrollments_courses_course_id",
                    column: x => x.course_id,
                    principalTable: "courses",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "fk_enrollments_users_student_id",
                    column: x => x.student_id,
                    principalTable: "users",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
            });

        migrationBuilder.CreateTable(
            name: "resources",
            columns: table => new
            {
                id = table.Column<Guid>(type: "uuid", nullable: false),
                course_id = table.Column<Guid>(type: "uuid", nullable: false),
                title = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: false),
                description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                type = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                section = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                url = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                file_object_id = table.Column<Guid>(type: "uuid", nullable: true),
                visibility = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                created_by = table.Column<Guid>(type: "uuid", nullable: false),
                created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false),
                updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: true)
            },
            constraints: table =>
            {
                table.PrimaryKey("pk_resources", x => x.id);
                table.ForeignKey(
                    name: "fk_resources_courses_course_id",
                    column: x => x.course_id,
                    principalTable: "courses",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Cascade);
                table.ForeignKey(
                    name: "fk_resources_users_created_by",
                    column: x => x.created_by,
                    principalTable: "users",
                    principalColumn: "id",
                    onDelete: ReferentialAction.Restrict);
            });

        migrationBuilder.CreateIndex(name: "ix_courses_instructor_id", table: "courses", column: "instructor_id");
        migrationBuilder.CreateIndex(name: "ix_courses_course_code_semester_section", table: "courses", columns: new[] { "course_code", "semester", "section" });
        migrationBuilder.CreateIndex(name: "ix_enrollments_course_id", table: "enrollments", column: "course_id");
        migrationBuilder.CreateIndex(name: "ix_enrollments_student_id", table: "enrollments", column: "student_id");
        migrationBuilder.CreateIndex(name: "ix_enrollments_course_id_student_id", table: "enrollments", columns: new[] { "course_id", "student_id" }, unique: true);
        migrationBuilder.CreateIndex(name: "ix_resources_course_id", table: "resources", column: "course_id");
        migrationBuilder.CreateIndex(name: "ix_resources_created_by", table: "resources", column: "created_by");
        migrationBuilder.CreateIndex(name: "ix_resources_course_id_visibility", table: "resources", columns: new[] { "course_id", "visibility" });
        migrationBuilder.CreateIndex(name: "ix_users_email", table: "users", column: "email", unique: true);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "resources");
        migrationBuilder.DropTable(name: "enrollments");
        migrationBuilder.DropTable(name: "courses");
        migrationBuilder.DropTable(name: "users");
    }
}
