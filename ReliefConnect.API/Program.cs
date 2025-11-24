var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add HttpClient for Supabase
builder.Services.AddHttpClient("Supabase", client =>
{
    client.BaseAddress = new Uri(builder.Configuration["SupabaseUrl"]!);
    client.DefaultRequestHeaders.Add("apikey", builder.Configuration["SupabaseKey"]);
    client.DefaultRequestHeaders.Add("Authorization", $"Bearer {builder.Configuration["SupabaseKey"]}");
});

// Add CORS
builder.Services.AddCors(options => {
    options.AddPolicy("AllowAll", b => b.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowAll");

app.UseHttpsRedirection();

app.MapControllers();

app.Run();
