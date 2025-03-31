using Client.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddHttpClient("ServerAPI", client => {
    client.BaseAddress = new Uri("https://localhost:7118/");
});

builder.Services.AddScoped<ApiServer>();

var app = builder.Build();


app.UseHttpsRedirection();


app.Run();

