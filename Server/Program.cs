using Microsoft.EntityFrameworkCore;
using Server.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<ApplicationDbContext>(options => options.UseSqlite("DataSource=Shop.db;Cache=Shared"));

builder.Services.AddControllers();

var app = builder.Build();

app.MapControllers();
app.UseHttpsRedirection();

app.Run();
