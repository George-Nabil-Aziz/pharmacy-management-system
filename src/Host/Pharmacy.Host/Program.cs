var builder = WebApplication.CreateBuilder(args);
builder.Services.AddHealthChecks();

var app = builder.Build();
app.MapHealthChecks("/health/live");
app.Run();

// Required so WebApplicationFactory<Program> can reference the entry point from the integration tests.
public partial class Program;
